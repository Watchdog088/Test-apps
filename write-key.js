const fs = require('fs');
const os = require('os');
const path = require('path');

const key = `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAyisQ+W5Xb1gvqaYNyPUlJ5n4J5+TKIq6b8osAkzCJjukrg5w
57duO3iOXH/RLrComjAAmZ/neMiLNO0nloP8Eb/M0bHTYLK1Tqwl9fF/8NmrtIeu
/kzLwEVgWu+Ub8ljwUsc3kKI5KQDOQlZ028LB98/7QnIgmAGTDxCCuMDyNd9/J7V
kKYgmcE8JqmX5VMIBw67wgnwH8LTCi0Mf2M/RyZE974s0aJgxiZlRgRD9Mu2GfMR
m42BGDx5Ys5DGBqVxUKqDv4alyQPKKCtVmLSDqBC+Mn7NJWWDIRTZqaiP6sXfe9E
MUp0urR/z5bo4vFqWMjvtqlj01ZbTrAZ1TbCQwIDAQABAoIBAQCeSK+mirScMZBH
pAIg94Zahhsbcr21vUAQ7FoehthvNL1PpXDSivQcTdwwIca2ZovrBHBD10VUdLdA
/fjDyJxfjSqgdzjG+cQoT3H9KFKCUPo1gxIIejoAVJEHQZKXHzciDFwSzEb/tEXt
rxuMBeG+DRWw0bsSEHp9z6PpgCnjYSY2PnUdY3K2v/woKuSDW+5A58Sn/XDeC9fH
anpF9q5iekpCfBDZ9X5tSxcwocRTRPqZDEsCjnph2T+VNjG3kRGDjIDT1XD+yi+R
K6jQpbZ+Of+DfCZnmSrjTKgw8hudnB5rAw9o02nF7B3TMe06gsYdzONhkRyKteuu
pGnI6wkBAoGBAP0ol0Bl8sx8+ARkey/aW90F5PZqeWkqtGPElby1XH9iR1TX1/uS
or494wPL9ju20TNJk5nfF/KFSbOOiJDPmc2iEMUYqVqA5bC+Aa+Y6KxcAQMgntU4
Ftmz5sJettHDJ2Y8iygVKt1GP99kZhLonBqFxBO0zFlfzknz7lJo58fDAoGBAMxv
9pUuupy9L01NEeZaTSDpiMbvT2JVjwG87ll7H2Y/YZnc3Oac3kuU8/7WRmzWvaiY
zxXfw+W7wbeK+Oc8D6REZJFRH3Tsdprol4HpfTR2BqbJ76NQ2/ssMGfeAtw8wQTx
fzLvmc8EjHnn2MUITEc8K8YtZYeFYq/Wjt4DL/OBAoGBAOJM3qgaeiiBrdN/Xv8v
2t6A3mPIWi/AlPB6UsAV/1F/sPQO3mtscT5OZBiIwtwuWGPYabEq1GVe8Lsptrp8
WaiQLx2BJiJZBvovX6Jwtc0dkWoSRumi8go53xXxRMvN//JMPLjf8ylKGt6/CN/u
P10WJmjXPbTHB8jj3S6dyFOxAoGBAI+nzXofD/q75dVH5uAbbD9IW1iPKRVMUeVC
waoXHoVW3FqmHIPgj0RFMv9LyskITNWAK2SPjLSOLx2uhiDWz5b6iECk5Jng36cS
8gPT8qs+lIX3OHFmjG3/KzSRiSkBeBDlMiC0xTv3Uk8HYAd0QUV9PrVPiRyl2ib9
ef7/9l4BAoGAAJmkQK0snYOaMDxTm9asdPLxjYWTWPhJoh3CfFH5TnoL7NhNWbXP
p9E99Yd8Zb+6LID0zkvBPBurNb1T85jT3oKPTPmYzzoaq2+UfzNW5FrKnuHw8jSn
UVuTDSOLF89TysEvpnibGNGDEHeBAHA1mWMd4YXOZpRpRV7Jx2VP3b0=
-----END RSA PRIVATE KEY-----
`;

const keyPath = path.join(os.homedir(), '.ssh', 'lynkapp-key.pem');
// Write with Unix line endings (LF only)
fs.writeFileSync(keyPath, key.replace(/\r\n/g, '\n'), { mode: 0o600 });
console.log('Key written to:', keyPath);
console.log('File size:', fs.statSync(keyPath).size, 'bytes');
