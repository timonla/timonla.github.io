---
layout: post
title: "BDD Test Naming for NUnit Tests"
subtitle: "Behavior driven test case naming scheme for readable and reusable test cases"
date: 2020-12-14
edited: 2020-12-22
permalink: "/blog/bdd-nunit-test-naming/"
thumbnail: "/assets/img/blog/thumbnails/bdd-nunit-test-naming.png"
hidden: false
---

The visual studio test explorer provides much more information than just how many
of our test cases are passing.
So just like Ruby Rhod we should ask ourselves the question: [*"How green?"*](https://youtu.be/B5_VQuNwims?t=112)

<div class="blog-post-img-header-container">
<img src="/assets/img/blog/bdd-nunit-test-naming/your-test-names-suck.png" class="blog-post-img-header"/>
<div class="blog-post-img-header-shadow">
</div>
</div>

We all have seen test cases with terrible names, like `Test1()`, that don't provide much 
information on what behavior they are testing.
We also all have seen test cases that are more descriptive but just annoying to read. 

```
GivenTheRobotIsTurnedOff_WhenTogglingThePower_ThenTheRobotShouldTurnOn()
```

In this post I document the test setup I use in NUnit projects to achieve a
[behavior driven development](https://dannorth.net/introducing-bdd/) (BDD) naming scheme.
Especially when doing BDD, our tests should read easily and tell us exactly what behaviors 
we have implemented.
Dan North presents his thoughts on how tests/behaviors should be named already in his initial
post.
Martin Fowler also shares a concise description, focusing on the test naming,
[in this blog post](https://martinfowler.com/bliki/GivenWhenThen.html).

### Here is my take

Similar to the bad example from above, we want to be able to tell, *given* which situation,
*when* performing which action, *then* what do we expect to happen.

* *Given* - pre-conditions
  * These include specifications on the state before execution.
    Having a background in software verification, the concept or pre-conditions,
    for me, includes conditions on the execution parameters as well.
* *When* - what is happening
  * A function call or possibly more complex execution.
* *Then* - post-conditions
  * Properties of the state or results of a function call.

Example:

* **Given** the robot is turned off
  * **When** toggling the power
    * **Then** the robot should turn on

What this example shows is exactly what we would like to see in the test explorer.
But we still want to be able to have readable and reusable test code.

### How to achieve this with NUnit

Some testing libraries like
[Kotest (kotlin)](https://github.com/kotest/kotest) natively support [behavior specifications](https://github.com/kotest/kotest/blob/master/doc/styles.md#behavior-spec).
NUnit does not.
So how do we best use what we have (`namespaces`, `classes`, `functions`) to achieve 
something similar?

My solution offers the following features:
* Test cases in *Given/When/Then* pattern
* High reusability of setup fixtures when adding more test cases
* Great readability of the test classes
* Great readability in the test explorer
* Conjugate *Given* conditions without repeated code
* Multiple *Then* conditions without repeated setup

The examples from the post are available in [this GitHub repository](https://github.com/timonla/robot-test-project).

#### Classes - *Given*

In the *given* part we specify the pre-conditions for a behavior.
We need to be able to conjugate these and don't want to repeat ourselves in the code.
NUnit `TestFixtures` are a perfect match for these requirements.
We can write a single `SetUp` function to execute before each test.

```c#
[TestFixture]
public class GivenRobotIsTurnedOff {
    public Robot robot;

    [SetUp]
    public virtual void Setup() {
        robot = new Robot();
        robot.State = RobotState.Off;
    }
}
```

##### Inheritance - *And*

Using the class abstraction for our pre-conditions, comes with the added bonus that the test
explorer conjugates nested classes with a + sign, which reads just as well as an "and".
This supports the take that classes are the right choice for pre-conditions.

```c#
[TestFixture]
public class PowerSourceHasCharge : GivenRobotIsTurnedOff {
    [SetUp]
    public override void Setup() {
        base.Setup();
        var powerSource = Mock.Create<PowerSource>();
        Mock.Arrange(() => powerSource.HasCharge()).Returns(true);
        robot.PowerSource = powerSource;
    }
}
```

```
GivenRobotIsTurnedOff+PowerSourceHasCharge
```

#### Namespaces - *When*

I find that for the same action, I expect different sets of pre-conditions to result in
different sets of post-conditions.
That's why I only want to create a single namespace for an action and then classes and
functions will allow me to specify the different pairs of sets for one action.

Since the actions should be roughly the same in the entire namespace, it's convenient
to create a non-test-fixture class defining this action.
All *given* classes in the namespace can then inherit from this class with each of their 
test functions executing just `Act()` as the [*Act-part*](https://docs.microsoft.com/en-us/visualstudio/test/unit-test-basics?view=vs-2019#write-your-tests).
This does not affect the test names in the test explorer at all. 😌

```c#
namespace WhenTogglingPower {
    public class WhenTogglingPower {
        public Robot robot;

        public void Act() {
            robot.TogglePower();
        }
    }

    [TestFixture]
    public class GivenRobotIsTurnedOff : WhenTogglingPower {
        [Test]
        public void ShouldTurnOn() {
            Act();
            robot.State.Should().Be(RobotState.On);
        }
    }
}
```

#### Functions - *Then/Should*

I prefer to prefix my test functions with *Should* rather than *Then*.
I find it reads more fluently in most cases.

We specify the post conditions with one `Test` function each.
Keep the descriptions concise.
If I had another post-condition for the robot, that a yellow light should have turned on,
that would be another `Test` function.
Since we can factor out the *Act-part* on the class or even namespace level, we don't 
have to repeat ourselves to test different post-conditions in different functions.

```c#
[Test]
public void ShouldTurnOn() {
    Act();
    robot.State.Should().Be(RobotState.On);
}
```

Looking at the test explorer, we see exactly what we were after. **Success** 🕺

```
GivenRobotIsTurnedOff+PowerSourceHasCharge
  WhenTogglingPowerButton
    ShouldTurnOn
```

The test explorer can group your test cases in many ways.
If you group by `Class(1), Namespace(2)` they will show up as *Given/When/Then*.
If you group by `Namespace(1), Class(2)` they will show up as *When/Given/Then*.

##### NUnit TestCase

With this setup it's still convenient to do parameterized tests and run multiple sets of input
parameters.

```c#
namespace WhenCheckingCharge {
    [TestFixture]
    public class GivenBatteryHasPercentageGreaterZero {
        [TestCase(1)]
        [TestCase(2)]
        [TestCase(69)]
        [TestCase(100)]
        public void ShouldHaveCharge(int batteryPercentage) {
            var battery = new Battery(batteryPercentage);
            var actual = battery.HasCharge();
            actual.Should().BeTrue();
        }
    }
}
```

```
GivenBatteryHasPercentageGreaterZero
  WhenCheckingCharge
    ShouldHaveCharge
      ShouldHaveCharge (69)
      ShouldHaveCharge (2)
      ShouldHaveCharge (100)
      ShouldHaveCharge (1)
```

#### Directory structure

Since we use everything downwards from namespace for behavior specifications,
we can use the directory and file names to keep track of which public interfaces we 
are testing.
I use directory names to keep track of class names and name the test files after the 
namespace they include.
This has the nice side effect of providing an excellent overview in the solution explorer as well.
