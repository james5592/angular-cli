// tslint:disable:max-line-length
import * as fs from 'fs-extra';
import { expect } from 'chai';
import * as path from 'path';

const ng = require('../helpers/ng');
const tmp = require('../helpers/tmp');
const SilentError = require('silent-error');

const root = process.cwd();

describe('Acceptance: ng generate directive', function () {
  beforeEach(function () {
    return tmp.setup('./tmp').then(function () {
      process.chdir('./tmp');
    }).then(function () {
      return ng(['new', 'foo', '--skip-install']);
    });
  });

  afterEach(function () {
    this.timeout(10000);

    return tmp.teardown('./tmp');
  });

  it('flat', function () {
    return ng(['generate', 'directive', 'flat']).then(() => {
      const testPath = path.join(root, 'tmp/foo/src/app/flat.directive.ts');
      expect(fs.pathExistsSync(testPath)).to.equal(true);
    });
  });

  it('my-dir --flat false', function () {
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-dir/my-dir.directive.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-dir/my-dir.directive.spec.ts');
    const appModulePath = path.join(appRoot, 'src/app/app.module.ts');

    return ng(['generate', 'directive', 'my-dir', '--flat', 'false'])
      .then(() => {
        expect(fs.pathExistsSync(testPath)).to.equal(true);
        expect(fs.pathExistsSync(testSpecPath)).to.equal(true);
      })
      .then(() => fs.readFile(appModulePath, 'utf-8'))
      .then(content => {
        expect(content).matches(/import.*\bMyDirDirective\b.*from '.\/my-dir\/my-dir.directive';/);
        expect(content).matches(/declarations:\s*\[[^\]]+?,\r?\n\s+MyDirDirective\r?\n/m);
      });
  });

  it('my-dir --flat false --no-spec', function () {
    const appRoot = path.join(root, 'tmp/foo');
    const testPath = path.join(appRoot, 'src/app/my-dir/my-dir.directive.ts');
    const testSpecPath = path.join(appRoot, 'src/app/my-dir/my-dir.directive.spec.ts');

    return ng(['generate', 'directive', 'my-dir', '--flat', 'false', '--no-spec'])
      .then(() => {
        expect(fs.pathExistsSync(testPath)).to.equal(true);
        expect(fs.pathExistsSync(testSpecPath)).to.equal(false);
      });
  });

  it('test' + path.sep + 'my-dir', function () {
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', 'test'));
    return ng(['generate', 'directive', 'test' + path.sep + 'my-dir', '--flat', 'false'])
      .then(() => {
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'test', 'my-dir', 'my-dir.directive.ts');
        expect(fs.pathExistsSync(testPath)).to.equal(true);
      });
  });

  it('test' + path.sep + '..' + path.sep + 'my-dir', function () {
    return ng(['generate', 'directive', 'test' + path.sep + '..' + path.sep + 'my-dir', '--flat', 'false'])
      .then(() => {
        const testPath = path.join(root, 'tmp', 'foo', 'src', 'app', 'my-dir', 'my-dir.directive.ts');
        expect(fs.pathExistsSync(testPath)).to.equal(true);
      });
  });

  it('my-dir from a child dir', () => {
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        process.env.CWD = process.cwd();
        return ng(['generate', 'directive', 'my-dir', '--flat', 'false']);
      })
      .then(() => {
        const testPath =
          path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-dir', 'my-dir.directive.ts');
        expect(fs.pathExistsSync(testPath)).to.equal(true);
      });
  });

  it('child-dir' + path.sep + 'my-dir from a child dir', () => {
    fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir'));
    return new Promise(function (resolve) {
      process.chdir('./src');
      resolve();
    })
      .then(() => process.chdir('./app'))
      .then(() => process.chdir('./1'))
      .then(() => {
        process.env.CWD = process.cwd();
        return ng(['generate', 'directive', 'child-dir' + path.sep + 'my-dir', '--flat', 'false']);
      })
      .then(() => {
        const testPath = path.join(
          root, 'tmp', 'foo', 'src', 'app', '1', 'child-dir', 'my-dir', 'my-dir.directive.ts');
        expect(fs.pathExistsSync(testPath)).to.equal(true);
      });
  });

  it('child-dir' + path.sep + '..' + path.sep + 'my-dir from a child dir',
    () => {
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          process.env.CWD = process.cwd();
          return ng(['generate', 'directive', 'child-dir' + path.sep + '..' + path.sep + 'my-dir', '--flat', 'false']);
        })
        .then(() => {
          const testPath =
            path.join(root, 'tmp', 'foo', 'src', 'app', '1', 'my-dir', 'my-dir.directive.ts');
          expect(fs.pathExistsSync(testPath)).to.equal(true);
        });
    });

  it(path.sep + 'my-dir from a child dir, gens under ' +
    path.join('src', 'app'),
    () => {
      fs.mkdirsSync(path.join(root, 'tmp', 'foo', 'src', 'app', '1'));
      return new Promise(function (resolve) {
        process.chdir('./src');
        resolve();
      })
        .then(() => process.chdir('./app'))
        .then(() => process.chdir('./1'))
        .then(() => {
          process.env.CWD = process.cwd();
          return ng(['generate', 'directive', path.sep + 'my-dir', '--flat', 'false']);
        })
        .then(() => {
          const testPath =
            path.join(root, 'tmp', 'foo', 'src', 'app', 'my-dir', 'my-dir.directive.ts');
          expect(fs.pathExistsSync(testPath)).to.equal(true);
        });
    });

  it('..' + path.sep + 'my-dir from root dir will fail', () => {
    return ng(['generate', 'directive', '..' + path.sep + 'my-dir']).then(() => {
      throw new SilentError(`ng generate directive ..${path.sep}my-dir from root dir should fail.`);
    }, (err) => {
      expect(err).to.equal(`Invalid path: "..${path.sep}my-dir" cannot be above the "src${path.sep}app" directory`);
    });
  });

  it('converts dash-cased-name to a camelCasedSelector', () => {
    const appRoot = path.join(root, 'tmp/foo');
    const directivePath = path.join(appRoot, 'src/app/my-dir.directive.ts');
    return ng(['generate', 'directive', 'my-dir'])
      .then(() => fs.readFile(directivePath, 'utf-8'))
      .then(content => {
        // expect(content).matches(/selector: [app-my-dir]/m);
        expect(content).matches(/selector: '\[appMyDir\]'/);
      });
  });

  it('should error out when given an incorrect module path', () => {
    return Promise.resolve()
      .then(() => ng(['generate', 'directive', 'baz', '--module', 'foo']))
      .catch((error) => {
        expect(error).to.equal('Specified module does not exist');
      });
  });

  describe('should import and add to declaration list', () => {
    it('when given a root level module with module.ts suffix', () => {
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'directive', 'baz', '--module', 'app.module.ts']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          expect(content).matches(/import.*BazDirective.*from '.\/baz.directive';/);
          expect(content).matches(/declarations:\s+\[\r?\n\s+AppComponent,\r?\n\s+BazDirective\r?\n\s+\]/m);
        });
    });

    it('when given a root level module with missing module.ts suffix', () => {
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/app.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'directive', 'baz', '--module', 'app']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          expect(content).matches(/import.*BazDirective.*from '.\/baz.directive';/);
          expect(content).matches(/declarations:\s+\[\r?\n\s+AppComponent,\r?\n\s+BazDirective\r?\n\s+\]/m);
        });
    });

    it('when given a submodule with module.ts suffix', () => {
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'directive', 'baz', '--module', path.join('foo', 'foo.module.ts')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          expect(content).matches(/import.*BazDirective.*from '..\/baz.directive';/);
          expect(content).matches(/declarations:\s+\[BazDirective]/m);
        });
    });

    it('when given a submodule with missing module.ts suffix', () => {
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'directive', 'baz', '--module', path.join('foo', 'foo')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          expect(content).matches(/import.*BazDirective.*from '..\/baz.directive';/);
          expect(content).matches(/declarations:\s+\[BazDirective]/m);
        });
    });

    it('when given a submodule folder', () => {
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/foo.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'directive', 'baz', '--module', 'foo']))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          expect(content).matches(/import.*BazDirective.*from '..\/baz.directive';/);
          expect(content).matches(/declarations:\s+\[BazDirective]/m);
        });
    });

    it('when given deep submodule folder with missing module.ts suffix', () => {
      const appRoot = path.join(root, 'tmp/foo');
      const modulePath = path.join(appRoot, 'src/app/foo/bar/bar.module.ts');

      return Promise.resolve()
        .then(() => ng(['generate', 'module', 'foo']))
        .then(() => ng(['generate', 'module', path.join('foo', 'bar')]))
        .then(() => ng(['generate', 'directive', 'baz', '--module', path.join('foo', 'bar')]))
        .then(() => fs.readFile(modulePath, 'utf-8'))
        .then(content => {
          expect(content).matches(/import.*BazDirective.*from '..\/..\/baz.directive';/);
          expect(content).matches(/declarations:\s+\[BazDirective]/m);
        });
    });
  });
});
