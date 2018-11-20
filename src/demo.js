import React, { Component } from 'react';
import './App.css';
import img from './training/train.jpeg';
import train from './training/train.jpeg';
//Import Ml5
// import * as ml5 from "ml5";
// import * as tf from '@tensorflow/tfjs';

//import axios

import axios from 'axios';

class App extends Component {

  state = {
    predictions: [] , // Set the empty array predictions state
    search:'',
    images:[],
    
  }


  imageSearch= (e)=>{
    
    this.setState({search:e.target.value});

  }

   onSubmit= async (e)=>{
  e.preventDefault();
      let url=`https://pixabay.com/api/?key=10523007-b08f0451dff2ad62da06bf4df&q=${this.state.search}&
      &per_page=5&image_type=photo&pretty=true`;
   const images=await axios.get(url);


    this.setState({images:images.data.hits});

  

   }
   trainData(){

    let features = ml5.featureExtractor('MobileNet');
    const classifier = features.classification();


    //train
    classifier.addImage(train, 'train');
    classifier.addImage(img, 'car');
   

    //train our model
    classifier.train();

    classifier.classify(img, gotResult);

function gotResult(labels) {
  console.log(labels);
}
  }


  setPredictions = (pred) => {
    // Set the prediction state with the model predictions
    this.setState({
      predictions: pred
    });
  }

  classifyImg = (id) => {
    // Initialize the Image Classifier method with MobileNet
    const classifier = ml5.imageClassifier('MobileNet', modelLoaded);
    // When the model is loaded
    function modelLoaded() {
      console.log('Model Loaded!');
    }

    console.log(id);
    // Put the image to classify inside a variable
    const image = document.getElementById(id);
  
    // Make a prediction with a selected image
    classifier.predict(image, 5, function(err, results) {
      console.log(results);
    // Return the results
      return results;
    })
      .then((results) => {
        // Set the predictions in the state
        this.setPredictions(results)
      })
  }
  selectImage=(e,id)=>{
    // e.preventDefault();
    console.log(e,id);
    // this.classifyImg('img_1');
  }

  componentDidMount(){
    // once the component has mount, start the classification
    
    
    //our own model

    // this.trainData();
  }

  render() {
    // First set the predictions to a default value while loading
    let predictions = (<div className="loader"></div>);
    // Map over the predictions and return each prediction with probability
    if(this.state.predictions.length > 0){
      predictions = this.state.predictions.map((pred, i) => {
        let { className, probability } = pred;
        // round the probability with 2 decimal
        probability = Math.floor(probability * 10000) / 100 + "%";
        return (
          <div key={ i + "" }>{ i+1 }. Prediction: { className } at { probability } </div>
        )
      })
    }
    let image;
  let {images,search}=this.state;
  image= this.state.images.map((img,index)=>{
    return(
      <img id={'img_'+index} crossOrigin="anonymous" onClick={this.selectImage.bind(this,'img_'+index)} src={img.largeImageURL} key={index} alt={img.tag} width="200" height="200" className="img"/>
    )
  })



  




    return (
      // let {search}=
     
      <div className="App">

      <div className="container">
      <h1>Image classification with ML5.js</h1>
      <form onSubmit={this.onSubmit}>
      <input type="search"  name={search}  onChange={this.imageSearch} />
      <input type="submit"  />
      </form> 
       </div>
       <div className="imageContainer">
          {image} 
       </div>
     
      
  
      </div>
    );
  }
}

export default App;

