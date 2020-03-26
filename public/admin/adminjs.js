function cityandpriceUpdate(){  

    var out='<tr class="active">\
    <th class="success">City / Distric</th>\
    <th class="success">Per KM Price Commision Base</th>\
    <th class="success">Per KM Price Pre Ride</th>\
    <th class="success">Minimum Price</th>\
    <th class="success">Minimum KM</th>\
    <th class="success">Travel Mode</th>\
    <th class="success">Incentive</th>\
    <th class="success">Driver Pay Out</th>\
    </tr>';
   $.post('getCityprice',{},function(data){
       if(data){
        
        data.forEach(function(val, key , arr){
            
        out+='<tr class="success">\
        <td class="success">'+val.CityName+'</td>\
        <td class="success">'+val.PerKMPrice+'</td>\
        <td class="success">'+val.preRidekmprice+'</td>\
        <td class="success">'+val.minimumPricePer+'</td>\
        <td class="success">'+val.minimumKM+'</td>\
        <th class="success">'+val.travelMode+'</th>\
        <th class="success">'+val.rideIncetiv+'</th>\
        <th class="success">'+val.driverpayout+'</th>\
        </tr>';  
           if(key===arr.length-1){
            
            $("#tablecontent").html(out)
            
           } 
        });
        
       }
   })
}