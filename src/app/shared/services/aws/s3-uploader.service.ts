import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';

@Injectable({
  providedIn: 'root'
})
export class S3UploaderService {

  TEST_REMOVE_BASE64_HEADING = false;

  PHOTO_FOLDER = 'photo/';
  VIDEO_FOLDER = 'video/';
  _validImageFileExtensions = ['.jpg', '.jpeg', '.bmp', '.gif', '.png'];
  
  constructor() { }

    // tslint:disable-next-line:typedef
  uploadFile(file, callback) {
    const bucket = new S3(
      {
        accessKeyId: 'AKIAVXT3XDWC2EL4WGUM',
        secretAccessKey: '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',
        region: 'us-west-2'
      }
    );
    const date = new Date();
    const params = {
      Bucket: 'acubedpixtagram',
      Key: this.PHOTO_FOLDER + this.guidGenerator() + '.' + this.fileExtension(file.name),
      Body: file,
      ACL: 'public-read'
    };

    bucket.upload(params, callback);

  }

  uploadPhoto(imageData, callback) {
    const bucket = new S3(
      {
        accessKeyId: 'AKIAVXT3XDWC4EXVDIHS',
        secretAccessKey: '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',
        region: 'us-west-2'
      }
    );
    const date = new Date();

    if ( this.TEST_REMOVE_BASE64_HEADING ) {
      let pos = imageData.indexOf(",");
      imageData = imageData.substr(pos+1);
    }

    const data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buff = new Buffer(data, 'base64');
    
    const params = {
      Bucket: 'pixtagram',
      Key: this.PHOTO_FOLDER + this.guidGenerator() + '.png' ,
      Body: buff,
      ContentEncoding: 'base64',
      ContentType: 'image/png',
      ACL: 'public-read'
    };

    bucket.upload(params, callback);

  }

  private guidGenerator() {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  }
  private fileExtension(url) {
    return url.split('.').pop().split(/\#|\?/)[0];
  }

  public ValidateImageFile(sFileName) {
    if (sFileName.length > 0) {
      var blnValid = false;
      for (var j = 0; j < this._validImageFileExtensions.length; j++) {
        var sCurExtension = this._validImageFileExtensions[j];
        if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
          blnValid = true;
          break;
        }
      }
      if (!blnValid) {
        return false;
      }
    }
    return true;
  }
}
