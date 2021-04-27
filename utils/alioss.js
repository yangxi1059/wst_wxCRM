const Base64 = require('./alioss/base64.js');
const Crypto = require('./alioss/crypto.js');
const timeout = 87600;


export function uploadFile(filePath, aliOSS, fileName) {

  return new Promise(function (resolve, reject) {

    if (!filePath) {
      reject({
        status: false,
        err: '文件错误',
      });
      return;
    }

    //文件后缀
    const policyBase64 = Base64.encode(JSON.stringify({
      "expiration": new Date(new Date().getTime() + timeout).toISOString(),
      "conditions": [
        ["content-length-range", 0, 1024 * 1024 * 10] //10m
      ]
    }));
    let bytes = Crypto.util.HMAC(Crypto.util.SHA1, policyBase64, aliOSS.accessKeySecret, {
      asBytes: true
    });
    const signature = Crypto.util.bytesToBase64(bytes);
    var myDate = new Date();
    var time = myDate.toLocaleDateString().split('/').join('-');
    var file = 'voucher/vacate/' + time + '/' + fileName + '.png';
   
    wx.uploadFile({
      url: aliOSS.hostAddress,
      filePath: filePath,
      name: 'file',
      formData: {
        'key': aliOSS.hostAddress + '/'+ file,
        'OSSAccessKeyId': aliOSS.accessKeyId,
        'policy': policyBase64,
        'signature': signature,
        'success_action_status': '200',
        'x-oss-security-token': aliOSS.securityToken
      },
      success: function (res) {
        if (res.errMsg === 'uploadFile:ok') {
          let url = aliOSS.hostAddress + '/'+ file;
          resolve({
            status: true,
            data: {
              url
            }
          })
        }
      },
      fail: function (err) {
        reject({
          status: false,
          err
        })
      }
    })
  })
}