import React, { Component } from 'react';

//Import Ml5
import * as ml5 from "ml5";
// import * as tf from '@tensorflow/tfjs';

//import axios
import axios from 'axios';

class Pretrained extends Component {

  state = {
    predictions: [] , 
    search:'',
    images:[],
    loader:false,
    model:false
  }


  imageSearch= (e)=>{
    this.setState( { search:e.target.value } );
  }


   onSubmit= async (e)=>{
     e.preventDefault( ) ;

     this.setState( { loader : true } );

     let url=` https://pixabay.com/api/?key=10523007-b08f0451dff2ad62da06bf4df&q=${this.state.search}&
     &per_page=5&image_type=photo&pretty=true ` ;

     const images = await axios.get( url ) ;

     this.setState( { images:images.data.hits,loader:false});

   }
   trainData(){
    // let features = ml5.featureExtractor('MobileNet');
    // const classifier = features.classification();
    // //train
    // classifier.addImage(train, 'train');
    // classifier.addImage(img, 'car');
  
    // //train our model
    // classifier.train();
    // classifier.classify(img, gotResult);
    // function gotResult(labels) {
    //   console.log(labels);
    // }
  }


  setPredictions = (pred) => {
    // Set the prediction state with the model predictions
    this.setState({
      predictions: pred
    });
    this.setState({loader:false});
    this.setState({model:true});
  }

  classifyImg = (id) => {
    // Initialize the Image Classifier method with MobileNet
    const classifier = ml5.imageClassifier('MobileNet', modelLoaded);
    // When the model is loaded
    function modelLoaded() {
      console.log('Model Loaded!');
    }

    // get the image to classify
    const image = document.getElementById(id);
    
    this.setState({loader:true});
    // Make a prediction with a selected image 

    classifier.predict(image, 5, function(err, results) {
    
      console.log(results);

      return results;
    })
    .then((results) => {
        this.setPredictions(results)
      })
  }
  selectImage=(e,id)=>{
    // e.preventDefault();
    console.log( e,id );
    this.classifyImg( e );
  }

  componentDidMount(){
  }

  render() {
 
    let predictions = (
      <div className="load-wrapp">
            <div className="load-5">
                <p>Loading</p>
                <div className="ring-2">
                    <div className="ball-holder">
                        <div className="ball"></div>
                    </div>
                </div>
            </div>
          </div>
    );

    let predictedProbability;

    if(this.state.predictions.length > 0){

      predictedProbability = this.state.predictions.map((pred, i) => {

        let { className, probability } = pred;

        probability = Math.floor(probability * 10000) / 100 + "%";
        
        return (
          <div className="box" key={ i + "" }>{ i+1 }. Prediction: { className } at { probability } </div>
        )
      
      })
    
    } 
  let image;

  let {search,loader,model}=this.state;

  image = this.state.images.map((img,index)=>{

    return(
     <img id={'img_'+index} crossOrigin="anonymous" onClick={this.selectImage.bind(this,'img_'+index)} src={img.largeImageURL} key={index} alt={img.tag} width="200" height="200" className="img"/>
    )

  })

    return (
      <div className="App">
      <div className="container">
      <h1>Image classification with <span className="ml">Ml5.js</span></h1>
      <form onSubmit={this.onSubmit}>
      <input type="search"  name={search}  onChange={this.imageSearch} />
      <input type="submit"  />
      </form> 
       </div>
       <div className="imageContainer">
          {loader === false ? image : predictions} 
       </div>
       { model === true ? <div className="modal">
             <div className="model-container">
             <div className="header"><span>Predicted Results</span></div>
             <span className="close" onClick={()=>{
               this.setState({model:false})
             }}>X</span>
             {predictedProbability} 
             </div>
        </div> : ''}
         
      </div>

    );
  }
}

export default Pretrained;

