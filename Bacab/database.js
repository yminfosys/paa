var mongoose = require('mongoose');

//mongoose.set('useFindAndModify', false);
autoIncrement = require('mongoose-auto-increment');
const config = {
  autoIndex: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  
};
const mongojs = require('mongojs');
// const db = mongojs('mongodb://127.0.0.1:27017/admin', ['pilotcollections'])
//var uri='mongodb://sukanta82:sukanta82@ds149138.mlab.com:49138/mws';
//var uri='mongodb://sukanta82:sukanta82@ds163517.mlab.com:63517/mws';
//var uri='mongodb://localhost:27017/paacab';
var uri='mongodb://127.0.0.1:27017/paaindia';
//var uri='mongodb+srv://paacab:a1b1c3b4@paa-x8lgp.mongodb.net/paacab?retryWrites=true&w=majority';
///&connectTimeoutMS=1000&bufferCommands=false
///2dsphar indexing creat///////
function index2Dpilot(int,cb){
  console.log()
    const db = mongojs('mongodb://127.0.0.1:27017/paaindia', ['pilotcollections'])
    db.pilotcollections.createIndex({ "location" : "2dsphere" });
    cb({success:'1'});
  }

  

  function index2DpreRide(int,cb){
    console.log()
      const db = mongojs('mongodb://127.0.0.1:27017/paaindia', ['preridedriverlocationcollections'])
      db.preridedriverlocationcollections.createIndex({ "location" : "2dsphere" });
      cb({success:'1'});
    }

  function index2Ddriver(int,cb){
    console.log()
      const db = mongojs('mongodb://127.0.0.1:27017/paaindia', ['driverlocationcollections'])
      db.driverlocationcollections.createIndex({ "location" : "2dsphere" });
      cb({success:'1'});
    }

    function index2DdriverDroplocation(int,cb){
      console.log()
        const db = mongojs('mongodb://127.0.0.1:27017/paaindia', ['driverdropcollections','driverlocationcollections'])
        db.driverdropcollections.createIndex({ "droplocation" : "2dsphere" });
        db.driverlocationcollections.createIndex({ "location" : "2dsphere" });
        cb({success:'1'});
      }

  // function index2Dpilot(int,cb){
  //   console.log()
  //     const db = mongojs('mongodb://localhost:27017/paacab', ['pilotcollections'])
  //     db.pilotcollections.createIndex({ "location" : "2dsphere" });
  //     cb({success:'1'});
  //   }
  function index2Ddemand(int,cb){
    console.log()
      const db = mongojs('mongodb://127.0.0.1:27017/paaindia', ['demandcollections']);
      db.demandcollections.createIndex({ "location" : "2dsphere" });
      cb({success:'1'})
    }
function mongCon(){
mongoose.connect(uri,config).
catch(error => handleError(error));
}
mongCon();
mongoose.connection.on('error', err => {
  //logError(err);
  console.log(err)
  setTimeout(mongCon,20000);
  
});
autoIncrement.initialize(mongoose.connection);

////customer Schema
var custSchema = new mongoose.Schema({ 
    name:  String,
    email :String,
    address:String,
    postcode:String,
    password: String,    
    mobileNumber:String, 
    isdCode:String,       
    CustID:String,
    walletBalance:String,
    BuyKM:String,   
    custRating:String,   
    userType:String,
    orderStage:String,
    generalPriceperKm:[],
    generalMinimumprice:[],
    generalMinimumKm:[],
    generalBasePrice:[],
    preRidePriceperKm:[],
    preRideperMinutCharge:[],
    GenarelPerMinutCharge:[],
    driverPayout:[],
    shereRide:[],
    shereRideCapacity:[],
    regdate: { type: Date, default: Date.now },
    lastLogindate: { type: Date },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true
      },
      coordinates: {
        type: [Number],
        required: true,
        
      }
    }
});

custSchema.plugin(autoIncrement.plugin, { model: 'custcollections', field: 'CustID',startAt: 1000, incrementBy: 1 });

var custmodul = mongoose.model('custcollections', custSchema);


///Pilot Schema
var pilotSchema = new mongoose.Schema({ 
  name:  String,
  email :String,
  address:String,
  city:String,
  postcode:String,
  password: String,    
  mobileNumber:String,
  isdCode:String,    
  pilotID:String,
  pilotRating:String,
  /////price per km 
  pilotGetperKm:String,
  accountStatus:String,
  completereg:String,   
  userType:String,
  typeOfWork:[],
  travelmod:String,
  rtoRegno:String,
  carModel:String,
  duty:String, 
  bankAccountNo:String,
  ifsc:String,
  sortCode:String, 
  jobCategory:String,
  jobSubCategory:String,
  ageGroup:String,
  experance:String,
  panNumber:String,
  gender:String,
  photo:String,Idproof:String,dl:String,rto:String,insurence:String,polution:String,
  orderStage:String,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  }
});

pilotSchema.plugin(autoIncrement.plugin, { model: 'pilotcollections', field: 'pilotID',startAt: 1000, incrementBy: 1 });

var pilotmodul = mongoose.model('pilotcollections', pilotSchema);


///Driver Attendence
var DutyLogSchema = new mongoose.Schema({     
  pilotID:String, 
  logonTime:String,
  logOutTime:String,
  logOutPurpose:String,
  date: { type: Date, default: Date.now },  
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  }
});

var DutyLogmodul = mongoose.model('DutyLogcollections', DutyLogSchema);

///Driver Car LogBook
var CarlogbookSchema = new mongoose.Schema({     
  pilotID:String, 
  travalKM:String,
  StartLocation:String,
  EndLocation:String,
  date: { type: Date, default: Date.now },
  remarks:String 
  
});

var Carlogbookmodul = mongoose.model('Carlogbookcollections', CarlogbookSchema);

///Driver Car LogBook
var testLocationSchema = new mongoose.Schema({     
  pilotID:String, 
  travalKM:String,
  StartLocation:String,
  EndLocation:String,
  date: { type: Date, default: Date.now },
  remarks:String 
  
});

var testLocationmodul = mongoose.model('testcollections', testLocationSchema);


///Ride book Schema
var rideSchema = new mongoose.Schema({ 
  bookingID:  String,
  pilotID :String,
  DriverType:String,
  CustID:String,
  picupaddress:String,
  picuklatlng: [],    
  dropaddress:String,     
  droplatlng:[],
  date: { type: Date, default: Date.now },
  startTime:String,   
  endTime:String,
  kmtravels:String,
  totalamount:String,
  generalBasePrice:String,
  paymentBy:String,
  driverCashCollectio:String,
  driverCashDeposit:String,
  discount:String,
  driverpayout:String,
  driverIncentiv:String,
  callbookingStatus:String,
  driverBusy:String,
  preRideOTP:String,
  startTime:{ type: Date},
  endTime:{ type: Date},
  totalTime:String,
  timefare:String,
  gstCharge:String
  
});


//rideSchema.plugin(autoIncrement.plugin, { model: 'ridecollections', field: 'bookingID',startAt: 1000, incrementBy: 1 });

var ridemodul = mongoose.model('ridecollections', rideSchema);
///Ride book Schema Counter
var rideCountSchema = new mongoose.Schema({ 
  bookingID:  String,   
});

//rideSchema.plugin(autoIncrement.plugin, { model: 'ridecollections', field: 'bookingID',startAt: 1000, incrementBy: 1 });

var rideCountmodul = mongoose.model('rideCountcollections', rideCountSchema);

///Wallet Order Schema Counter
var walletOrderCountSchema = new mongoose.Schema({ 
  walletOrderID:  String,   
});

var walletOrderCountmodul = mongoose.model('walletOrderCountcollections', walletOrderCountSchema);

///Wallet and Buy KM Recharge Schema 
var WalletBuyKMSchema = new mongoose.Schema({ 
  walletOrderID:  String,
  CustID:String,
  RechargeAmount:String,    
  BuyKM:String,
  date: { type: Date, default: Date.now },   
});

var WalletBuyKMmodul = mongoose.model('WalletBuyKMcollections', WalletBuyKMSchema);


///Price and Offer Mnager
var priceandOfferSchema = new mongoose.Schema({ 
  offerID:  String,
  area:String,
  CustID:String,
  travelmod:String,
  price:String,
  discount: String,    
  cupon:String,     
  distanceKM:String, 
  rideIncetiv:String 
});

priceandOfferSchema.plugin(autoIncrement.plugin, { model: 'priceandOffercollections', field: 'offerID',startAt: 1, incrementBy: 1 });
var priceandOffermodul = mongoose.model('priceandOffercollections', priceandOfferSchema);

///City Waise Price Variation
var cityPriceSchema = new mongoose.Schema({ 
  CityName:  String,
  preRidekmprice:String,
  PerKMPrice:String,
  basePrice:String,
  minimumPricePer:String,
  minimumKM:String,
  travelMode: String,    
  rideIncetiv:String,
  driverpayout:String,
  shareRide:String,
  shereRideCapacity:String,
  preRideperMinutCharge:String,
  GenarelPerMinutCharge:String
});

var cityPricemodul = mongoose.model('citypricecollections', cityPriceSchema);

////Demand Area Schema
var demandSchema = new mongoose.Schema({ 
  CustID:String,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  }
});

var demandmodul = mongoose.model('demandcollections', demandSchema);

////Driver Location Schema
var driverlocationSchema = new mongoose.Schema({ 
  pilotID:String,
  DriverType:String,
  rating:String,
  travelmod:String,
  accountStatus:String,
  driverBusy:String,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  } 
});
var driverlocationmodul = mongoose.model('driverlocationcollections', driverlocationSchema);

////driverDrop Location Update////
var driverdropSchema = new mongoose.Schema({ 
  pilotID:String,
  DriverType:String,
  rating:String,
  travelmod:String,
  accountStatus:String,
  driverBusy:String,
  droplocation: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  }
});

var driverdropmodul = mongoose.model('driverdropcollections', driverdropSchema);

////PreRide Driver Location Update////
var preridedriverlocationSchema = new mongoose.Schema({ 
  pilotID:String,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  }
});

var preridedriverlocationmodul = mongoose.model('preridedriverlocationcollections', preridedriverlocationSchema);




var sampleSchema=new mongoose.Schema({ 
  name: String,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      
    }
  }
})
sampleSchema.index({ location: '2dsphere'});

var sampleModule = mongoose.model('dadacollections', sampleSchema);

// custmodul({
//   name:'sukanta sardar',
//   location:{type:'Point',coordinates:[22.572646, 88.38389500000001]}
// }).save(function(r){
//   console.log("created");
// })
// db.mamacollections.find(function (err, docs) {
//   //docs is an array of all the documents in mycollection
//   console.log('mongojs test',docs);
// })
// db.dadacollections.createIndex({ "location" : "2dsphere" })
// sampleModule.find({
//   location: {
//     $near: {
//       $geometry: {
//          type: "Point" ,
//          coordinates: [ 87.8258247, 23.0101451 ]
//       },
//     }
//   }
// },function(e,data){
//   console.log('test result',JSON.stringify(data) );
// })

// index2Dpilot({},function(ss){
//   pilotmodul.find({
//     location: {
//       $near: {
//         $geometry: {
//            type: "Point" ,
//            coordinates: [ 87.2729185, 23.6662132 ]
//         },$maxDistance : 100000,
//       }
//     },pilottID:1000
//   },function(e,data){
//     console.log('test result',JSON.stringify(data) );
//   })
// })
// index2Dcust({},function(ss){
//   custmodul.find({
//     location: {
//       $near: {
//         $geometry: {
//            type: "Point" ,
//            coordinates: [ 87.8258247, 22.0101451 ]
//         },$maxDistance : 10000000,
//       }
//     },CustID:1000
//   },function(e,data){
//     console.log('test result',JSON.stringify(data) );
//   })
// })



module.exports.customer=custmodul;
module.exports.pilot=pilotmodul;
module.exports.index2Dpilot=index2Dpilot;
module.exports.index2Ddriver=index2Ddriver;
module.exports.index2DdriverDroplocation=index2DdriverDroplocation;
module.exports.index2Ddemand=index2Ddemand;

module.exports.index2DpreRide=index2DpreRide;

module.exports.ride=ridemodul;
module.exports.rideCounter=rideCountmodul;
module.exports.priceOffer=priceandOffermodul;
module.exports.cityPrice=cityPricemodul;
module.exports.demandArea=demandmodul;
module.exports.driverLocationArea=driverlocationmodul;
module.exports.driverdroplocation=driverdropmodul;

module.exports.preridedriverlocation=preridedriverlocationmodul;

module.exports.walletOrderCouner=walletOrderCountmodul;
module.exports.WalletBuyKM=WalletBuyKMmodul;
module.exports.DutyLog=DutyLogmodul;
module.exports.Carlogbook=Carlogbookmodul;


module.exports.testLocation=testLocationmodul;