Polling Station Search for Afghanistan
===========

**NB: DO NOT USE! This has not been updated to reflect the polling centers that the IEC has closed.**

Install dependencies: `npm install && bower install`

Test Server: `grunt server`

Build: `grunt build`

_[acrylc-af-pcsearch](https://github.com/developmentseed/af-polling-search/tree/acrylc-af-pcsearch) branch tracking work from: https://github.com/acrylc/af-pcsearch/tree/master_

#### Workflow
`master` branch will contain production files. `gh-pages` will mirror the `dist/` folder. Branch from `master` to do development. Pull request into `master`. Then build and push to `gh-pages.

1. Work in `app/` folder.

2. If new file created, ensure it is captured in `grunt.js`

3. To run locally, run `grunt server`. Site will run on port 9000.

4. To build the site, run `grunt build`. This will update the `dist/` folder. Ensure that grunt.js has copied all site files.

5. Push changes to branch: both `app/` and `dist/`.

6. Run `git subtree push --prefix dist origin gh-pages` to push `dist/` files to `gh-pages` branch.
