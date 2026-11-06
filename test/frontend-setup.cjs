const {TextEncoder,TextDecoder}=require('util');
global.TextEncoder=TextEncoder;global.TextDecoder=TextDecoder;
global.IS_REACT_ACT_ENVIRONMENT=true;
