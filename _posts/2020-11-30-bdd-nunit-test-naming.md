---
layout: post
title: "Proper Naming Scheme for NUnit Tests"
subtitle: "Behavior driven test case naming scheme for readable and reusable test cases"
date: 2020-11-30
permalink: "/blog/bdd-nunit-test-naming/"
thumbnail: "/assets/img/blog/thumbnails/diet-review-2020.png"
hidden: true
---

The visual studio test explorer provides you much more information than just how many
of your test cases are green.
So just like Ruby Rhod you should ask the question: [*"How green?"*](https://youtu.be/B5_VQuNwims?t=112)

<div class="blog-post-img-header-container">
<img src="/assets/img/blog/bdd-nunit-test-naming/your-test-names-suck.png" class="blog-post-img-header"/>
<div class="blog-post-img-header-shadow">
</div>
</div>

In this post I document the test setup I use in NUnit projects to achieve a
[behavior driven development](https://dannorth.net/introducing-bdd/) (BDD) naming scheme.
Especially when doing BDD, your tests should read easily and tell you exactly what behaviors 
you have implemented.
Dan North already presents his thoughts on how tests/behaviors should be named in his initial
post.
Martin Fowler also shares a concide description, focusing on the test naming,
[in this blog post](https://martinfowler.com/bliki/GivenWhenThen.html).

Examples:

* **Given** the robot is turned off
--> **When** toggling the power
--> **Then** the robot should turn on
* **Given** the robot is turned on
--> **When** toggling the power
--> **Then** the robot should turn off

Some testing libraries like
[Kotest (kotlin)](https://github.com/kotest/kotest) include layouts especially for
[behavior specification](https://github.com/kotest/kotest/blob/master/doc/styles.md#behavior-spec).
But how do we achieve something like this with NUnit?
We all have seen test cases with terrible names, that don't provide much information on what
behavior they are testing and we all have seen test functions named like this
`GivenTheRobotIsTurnedOff_WhenTogglingThePower_ThenTheRobotShouldTurnOn`.
This is incredibly inconvenient when reading the test cases, adding new ones or changing them.

### What this blog post presents

* Test cases in *Given/When/Then* pattern
* High reusability of setup fixtures when adding more test cases
* Great readability of the test classes
* Great readability in the test explorer
* Conjugate *Given* conditions without repeated code
* Multiple *Then* conditions without repeated setup

The next part presents the naming scheme that I prefer with a few examples before I will show
a few more tips and tricks, among others, to improve test case setup and reusability.

#### Classes - *Given*

In the given part we want to specify the pre-conditions for a behavior.
We want to be able to conjugate these without repeating ourselves in the code and no matter 
which conjunct we are in, the execution part will always be the same.
NUnit test fixtures are a perfect match for these requirements.
We can write a single setup function that can be executed before every test case and even factor out the execution part into a function that is executed in all the test cases.

```c#
namespace WhenToggelingRobotPower {
    static class WhenTogglingRobotPower {
        public static void act(Robot robot) {
            robot.power();
        }
    }

    [TestFixture]
    class GivenRobotIsTurnedOff {
        public static Robot robot;

        [SetUp]
        public virtual void SetUp() {
            robot = new Robot();
            robot.State = RobotState.Off;
        }

        public void act() {
            WhenTogglingRobotPower.act(robot);
        }

        [TestFixture]
        class BatteryHasPower : GivenRobotIsTurnedOff {
            [SetUp]
            public override void SetUp() {
                base.SetUp();
                robot.BatteryPercentage = 100;
            }

            [Test]
            public void ShouldTurnOn() {
                act();
                robot.State.Should().Be(RobotState.On);
            }
        }
    }
}
```

##### Internal classes - *And*

Using the class abstraction as pre-conditions, comes with the added bonus that the test
explorer conjugates nested classes with a + sign, which reads just as well as an "and".
This further supports the idea for classes as *Given* conditions.

![Nested Given](/assets/img/blog/bdd-nunit-test-naming/test-explorer-nested-given.png){:class="blog-post-img-small"}

It's also super convenient to reuse the setup.
Depending on the test case, it can make more sense to call the base setup earlier or later.

Having a background in software verification, the concept or pre-conditions for me includes 
conditions on the execution parameters.

#### Namespaces - *When*

The one downside to using the `namespace` is that I have not found a good way yet to only 
define the *act* part only once.

#### Functions - *Then/Should*

##### NUnit TestCase

With this setup it's still convenient to do parameterized tests and run multiple sets of input
parameters.

```c#
[TestFixture]
class BatteryHasPower : GivenRobotIsTurnedOff {
    [SetUp]
    public override void SetUp() {
        base.SetUp();
    }

    [TestCase(1)]
    [TestCase(2)]
    [TestCase(50)]
    [TestCase(100)]
    public void ShouldTurnOn(int batteryPercentage) {
        robot.BatteryPercentage = batteryPercentage
        act();
        robot.State.Should().Be(RobotState.On);
    }
}
```

![Parameterized Given](/assets/img/blog/bdd-nunit-test-naming/test-explorer-parameterized-test-cases.png){:class="blog-post-img-small"}

#### Files

Since we will be using everything downwards from `namespace` for behavior specifications,
we can use either the directory or and file name to keep track of which public interfaces we 
are testing.
I use directory names to keep track of class names and name the test files after the 
`namespace` they include.
This has the nice side effect of providing an excellent overview in the solution explorer as well.

![Solution Explorer](/assets/img/blog/bdd-nunit-test-naming/solution-explorer.png){:class="blog-post-img-small"}

#### Different test explorer views

The test explorer can group your test cases in many ways.
If you group by `Class(1), Namespace(2)` they will show up as *Given/When/Then*.
If you group by `Namespace(1), Class(2)` they will show up as *When/Given/Then*.

#### Using functions not as test functions

#### Factor out the *Act* of AAA

I like to structure my test cases in the *Arrange/Act/Assert* pattern.
Since I use name spaces to describe the *When/Act*, all the functions in one class will have
the same *act* so it can be moved to a non test case function in the top class.
