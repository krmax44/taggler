# Taggler

[![Build Status](https://travis-ci.com/krmax44/taggler.svg?branch=master)](https://travis-ci.com/krmax44/taggler)

Taggler is a CLI to quickly equip your local music files with high quality ID3 tags. It supports multiple data sources and ID3 writers.

## Installation and Usage

With `npm`:

```bash
npm i -g taggler # you may need to run it as root, depending on your npm install
taggler "Smash Mouth - All Star.mp3"
```

or run it without installing using `npx`:

```bash
npx taggler "Smash Mouth - All Star.mp3"
```

## System

Taggler is divided up into scrapers, writers and the Taggler CLI, that communicates with the former ones. Scrapers (like the Spotify scraper) try to find as much metadata about a file, which is then passed to a writer (like the ffmpeg writer) which actually bakes the data into the previously untagged file. This allows for various data sources and infinite customisability.

## Contributing

```bash
# 1. Fork the repo and clone it:
git clone "https://github.com/$USER/taggler.git"
cd taggler
# 2. Install dependencies and link them
yarn
yarn bootstrap
# 3. Create a branch
git checkout -b feat/my-cool-feature
# 4. Begin coding!
code . && exit
# 5. Push and create PR
git push
```
