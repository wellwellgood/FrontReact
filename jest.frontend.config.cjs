const path=require('path');
const modules=path.join(__dirname,'node_modules');
module.exports={
 rootDir:__dirname,
 testEnvironment:require.resolve('jest-environment-jsdom'),
 testMatch:['<rootDir>/src/components/dashboard/DashboardOverview.test.jsx'],
 setupFiles:['<rootDir>/test/frontend-setup.cjs'],
 clearMocks:true,
 moduleNameMapper:{
  '\\.css$':'<rootDir>/test/style-stub.cjs',
  '^react-router-dom$':modules+'/react-router-dom/dist/index.js',
  '^react-router/dom$':modules+'/react-router/dist/development/dom-export.js',
  '^react-router$':modules+'/react-router/dist/development/index.js',
 },
 transform:{'^.+\\.[jt]sx?$':[require.resolve('babel-jest'),{presets:[[require.resolve('@babel/preset-env'),{targets:{node:'current'}}],[require.resolve('@babel/preset-react'),{runtime:'automatic'}]]}]},
};
