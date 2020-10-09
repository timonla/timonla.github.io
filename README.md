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

* `bundle init`

* `bundle install`

* To run the site locally
`bundle exec jekyll serve --trace`
will provide the page at `localhost:4000`.