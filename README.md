# timon.la

This is my approach to a simple personal website to primarily show blog entries,
hosted on github.
The setup is inspired by [Hux Blog](https://github.com/Huxpro/huxpro.github.io) but much more basic.

## Development

### Local setup on WSL

* `sudo apt-get install ruby ruby-dev`

* `gem install bundler jekyll`

* `bundle init`

* `bundle install`

* To run the site locally
`bundle exec jekyll serve --trace`
will provide the page at `localhost:4000`.