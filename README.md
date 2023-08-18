# timon.la

This is my approach to a simple personal website to primarily show blog entries,
hosted by GitHub.
I started from scratch, reusing some structural parts of my previous website.
Have not used jekyll before and found the two examples from
[Huxpro](https://github.com/Huxpro/huxpro.github.io) and
[daattali](https://github.com/daattali/daattali.github.io) very helpful
while learning it.

## Development

### Local setup on WSL

* `sudo apt-get install ruby ruby-dev`

* `gem install bundler jekyll`

* `bundle install`

### Local setup in Ubuntu terminal with [rbenv](https://github.com/rbenv/rbenv#installing-ruby-versions)

* `sudo apt-get remove ruby ruby-dev`

* `sudo apt install rbenv`

* `rbenv init` and reopen terminal

* `rbenv install -l` and choose wanted version

* `rbenv local [the version you chose in the step above]`

* `gem install bundler jekyll`

* `bundle install`

### To run the site locally

`bundle exec jekyll serve --trace`
will provide the page at `localhost:4000`.
