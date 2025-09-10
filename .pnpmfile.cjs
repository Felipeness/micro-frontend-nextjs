module.exports = {
  hooks: {
    readPackage(pkg) {
      // Allow build scripts for Module Federation
      if (pkg.name === '@module-federation/nextjs-mf') {
        pkg.scripts = pkg.scripts || {};
      }
      return pkg;
    }
  }
};