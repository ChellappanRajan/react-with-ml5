import React, { Component } from 'react';
import * as tf from '@tensorflow/tfjs';
// import car from './car.jpeg';
import labels from './labels.json';


//Import Images

import car from './Images/Training/car-1.jpeg';
import car1 from './Images/Training/car-2.jpeg';

import car2 from './Images/Validation/car-3.jpeg';

import train from './Images/Training/train.jpeg';
import train1 from './Images/Training/train-2.jpg';

import train2 from './Images/Validation/train-3.jpeg';




class Transfer extends Component {

  //LoadMobilenet
  loadMobilenet() {
    return tf.loadModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
  }

  //Load the Image
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.crossOrigin="anonymous";
      img.onload = () => resolve(tf.fromPixels(img));
      img.onerror = (err) => reject(err);
    });
  }
  //End load the Image

  // crop the image
  cropImage(img) {
    const width = img.shape[0];
    const height = img.shape[1];
    const shorterSide = Math.min(img.shape[0], img.shape[1]);
    // calculate beginning and ending crop points
    const startingHeight = (height - shorterSide) / 2;
    const startingWidth = (width - shorterSide) / 2;
    const endingHeight = startingHeight + shorterSide;
    const endingWidth = startingWidth + shorterSide;
    // return image data cropped to those points
    return img.slice([startingWidth, startingHeight, 0], [endingWidth, endingHeight, 3]);
  }
  // End

  //resize the Image
  resizeImage(image) {
     return tf.image.resizeBilinear(image, [224, 224]);
  }
  //End
  
  //Start
  batchImage(image) {
    // Expand our tensor to have an additional dimension, whose size is 1
    const batchedImage = image.expandDims(0);
  
    // Turn pixel data into a float between -1 and 1.
    return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
  }
  //End


  //Start
  loadAndProcessImage(image) {
    const croppedImage = this.cropImage(image);
    const resizedImage = this.resizeImage(croppedImage);
    const batchedImage = this.batchImage(resizedImage);
    return batchedImage;
  }
  //End


predict(){
  this.loadMobilenet().then(pretrainedModel => {
   this.loadImage(train).then(img => {
      const processedImage = this.loadAndProcessImage(img);
      const prediction = pretrainedModel.predict(processedImage);
      const label=labels;
       const labelPrediction = prediction.as1D().argMax().dataSync()[0];
  console.log(`
    The predicted label is ${label[labelPrediction]}
  `);

      
    });
  });
  
}




//pre trained Model

buildPretrainedModel() {
  return this.loadMobilenet().then(mobilenet => {
    const layer = mobilenet.getLayer('conv_pw_13_relu');
    return tf.model({
      inputs: mobilenet.inputs,
      outputs: layer.output,
    });
  });
}
 
loadImages(images, pretrainedModel) {
  let promise = Promise.resolve();
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    promise = promise.then(data => {
      return this.loadImage(image).then(loadedImage => {
        return tf.tidy(() => {
          const processedImage = this.loadAndProcessImage(loadedImage, pretrainedModel);
          if (data) {
            const newData = data.concat(processedImage);
            data.dispose();
            return newData;
          }
          return tf.keep(processedImage);
        });
      });
    });
  }

  return promise;
}


oneHot(labelIndex, classLength) {
  return tf.tidy(() => tf.oneHot(tf.tensor1d([labelIndex]).toInt(), classLength));
};

Customlabels = [
  'car',
  'car',
  'train',
  'train',
];


getLabelsAsObject(labels) {
  let labelObject = {};
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    if (labelObject[label] === undefined) {
      labelObject[label] = Object.keys(labelObject).length;
    }
  }
  return labelObject;
}



addLabels(labels) {
  return tf.tidy(() => {
    const classes = this.getLabelsAsObject(labels);
    const classLength = Object.keys(classes).length;
    let ys;
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const labelIndex = classes[label];
      const y = this.oneHot(labelIndex, classLength);
      if (i === 0) {
        ys = tf.keep(y);
      } else {
        ys = ys.concat(y, 0);
      }
    }
    return ys;
  });
};

getModel(numberOfClasses) {
  const model = tf.sequential({
    layers: [
      tf.layers.flatten({inputShape: [ 224,224,3]}),
      tf.layers.dense({
        units: 10,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      tf.layers.dense({
        units: numberOfClasses,
        kernelInitializer: 'varianceScaling',
        useBias: false,
        activation: 'softmax'
      })
    ],
  });
  model.compile({
    optimizer: tf.train.adam(0.0001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
}


makePrediction(pretrainedModel, image, expectedLabel) {
 
  this.loadImage(image).then(loadedImage => {
    return this.loadAndProcessImage(loadedImage, pretrainedModel);
  }).then(loadedImage => {
    console.log('Expected Label', expectedLabel);
    // loadedImage.predict(model,loadedImage);
//  console.log('Predicted Label', mobilenet.predict(model, loadedImage));
    loadedImage.dispose();
  });
}
training = [
  car,
  car1,
  train,
  train1,
];

predictSModel(){ 

  this.buildPretrainedModel().then(pretrainedModel => {    
    this.loadImages(this.training, pretrainedModel).then(xs => {
      const ys = this.addLabels(this.Customlabels);
       const model = this.getModel(2);
      model.fit(xs, ys, {
        epochs: 10,
        shuffle: true,
      }).then(history => {
        // // make predictions
        this.makePrediction(pretrainedModel, car2, "0");
         this.makePrediction(pretrainedModel, train2, "1");
      });
    });
  });
}

  componentDidMount(){
  //  this.predict();
    this.predictSModel();
  }
  render() {
    return (
      <div className="App">

      </div>
    );
  }
}

export default Transfer;

