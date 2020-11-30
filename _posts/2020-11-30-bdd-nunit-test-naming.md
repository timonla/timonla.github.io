---
layout: post
title: "Proper Naming Scheme for Your NUnit Tests"
subtitle: "test"
date: 2020-11-30
permalink: "/blog/bdd-nunit-test-naming/"
thumbnail: "/assets/img/blog/thumbnails/diet-review-2020.png"
hidden: true
---

<div class="blog-post-img-header-container">
<img src="/assets/img/blog/bdd-nunit-test-naming/your-test-names-suck.png" class="blog-post-img-header"/>
<div class="blog-post-img-header-shadow">
</div>
</div>

The visual studio test explorer provides you much more information than just how many
of your test cases are green.
So just like Ruby Rhod you should ask the question: [*"How green?"*](https://youtu.be/B5_VQuNwims?t=112)

In this post I will make my case for properly naming your NUnit test cases and show how I solve this in practice.
Especially when doing [behavior driven development](https://dannorth.net/introducing-bdd/) (BDD), your tests should read easily and tell you exactly what behaviors you have implemented.
There are a few articles on how to structure your behavior driven test cases, yannics link is interesting, some testing libraries like hotline.test have excellent support for that but how do you best approach this in .net?

### How to name your tests/behaviors

BDD tests/behaviors cases follow the pattern *Given/When/Then*, describing pre-conditions actions and post-conditions.
Martin Fowler shares a really concide description on what the differnt parts mean [in this blog post](https://martinfowler.com/bliki/GivenWhenThen.html).

What should test namespaces look like?
Use test name spaces for the when action

#### What goes into the *Given* part?
Test file names as class under test. We still want to be able to see the public interface of which class we are testing

What should the given stand for? Coming from software verification i interpret this as preconditions. Hoare tuple

Test case names for multiple test case usage

Arrange act assert

Using the solution explorer to your advantage

what happens with local functions in vs test explorer?