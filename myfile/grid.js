window.onload = function(){

var mapSketch = function(p5j){
    p5j.earthquakes;
    p5j.loaded = 0; // 確認是否有讀取檔案
    p5j.map = L.map('map').setView([0,0], 1); // 經緯度 比例
    p5j.canvas;
    p5j.display = true;

    //https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
    //https://www.steamxo.com/wp-content/uploads/2018/11/4Vk4VO222004_475311.jpg

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 22
    }).addTo(p5j.map); // 將openstreetmap資料下載到 畫面中

    p5j.arr=[]; // 點雲
    p5j.arrarea=[]; // area

    p5j.download; // data
/*
    [
      [51.509, -0.08],
      [51.503, -0.06],
      [51.51, -0.047]
    ];

    var polygon = L.polygon([
    	[51.509, -0.08],
    	[51.503, -0.06],
    	[51.51, -0.047]
	]).addTo(p5j.map);

*/
  //oop
    var area = function(arr,popup){ // 輸入一系列area資料
      this.arr = arr;
      this.popup = popup;
      this.polygon = L.polygon(
        this.arr).bindPopup(this.popup).addTo(p5j.map);
      
      // 特殊滑鼠狀況
      this.polygon.on('mouseover',()=>{
        console.log('bb');
        this.polygon.setStyle({color:'red'}) 
        this.polygon.bindPopup("Here has pokemon!");
    
      })
      this.polygon.on('mouseout',()=>{
        console.log('ll');
        this.polygon.setStyle({color:'blue'})
      })


      }
      // setting hover      
      this.update = function(){
      
    }

    p5j.preload = function() { // 需要先讀取 json
      // 取得日期段內的強度大於3的地震
      let url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?' +
        'format=geojson&starttime=2020-03-01&endtime=2020-04-12&minmagnitude=3';

      p5j.httpGet(url, 'jsonp', false, function(response) {
        p5j.earthquakes = response; // 會把所有回呼資料存於 earthquakes
      });
    }


    p5j.setup = function(){
        p5j.canvas = p5j.createCanvas(1200,600);
        p5j.canvas.style('z-index:400');
    }
    p5j.draw = function(){
      if (!p5j.download) {
        
        return;
      }else {
          if (p5j.loaded === 1){
            // 每次增加一個polygon
            p5j.download.feed.entry.forEach((v)=>{
              let lat = v.gsx$lat.$t.split(','); // 取得lat資料字串
              let lng = v.gsx$lng.$t.split(','); // 取得lng資料字串
              let val = v.gsx$data.$t.split(','); // 取得資料字串
              let num = v.gsx$num.$t;
              let name = v.gsx$name.$t;
              let arr = [];
              lat.forEach((v,i)=>{
                arr.push(L.latLng(parseFloat(lat[i]),parseFloat(lng[i])));
              });
              p5j.arrarea.push(new area(arr,val))
            });
            
        }
        
        p5j.loaded +=1;
      }

      $('#content').html('POLYGON<br>目前有 '+p5j.arrarea.length+' 個');
    }

    p5j.mouseReleased = function(e) {
      // 確保在畫面內 點擊
      if (p5j.mouseX>0 && p5j.mouseX<$('#map').width() && p5j.mouseY>0 && p5j.mouseY<$('#map').height() ){ 

        if (p5j.mouseButton === 'left'){
          let pix = [p5j.mouseX,p5j.mouseY];
          let latlng = p5j.map.mouseEventToLatLng(e);

          if (p5j.display){
            this.arr.push(latlng);
            p5j.circle(pix[0],pix[1],5);
          }        
        }else if (p5j.mouseButton === 'center'){
          if (p5j.arr.length < 3){
          }else{
            p5j.arrarea.push(new area(p5j.arr,"val"));
            p5j.arr = [];
            p5j.arrarea.forEach((v)=>{
              console.log(v.arr);
            });
            
          }

        }

        
      }
    }

    $('#zbutton').click((e)=>{
      if(e.target.getAttribute('aria-pressed')==='true'){
          p5j.canvas.style('z-index:0');
          p5j.display = false;
      }else{
          p5j.canvas.style('z-index:400');
          p5j.display = true;
      }
    });
    $('#cbutton').click(()=>{
        p5j.arr = [];
        p5j.clear();

    });
    $('#lbutton').click(()=>{
        let url = 'https://spreadsheets.google.com/feeds/list/1K1efiDfH-h18Bb8pDEYCx1_Bqr2GLDoWFR4nV3Bxb2c/1/public/values?alt=json';
        p5j.loaded=0;
        //console.log(url);
        p5j.httpGet(url, 'jsonp', false, function(response) {
          p5j.download = response; // 會把所有回呼資料存於 earthquakes
        });

        
    });
    $('#ubutton').click(()=>{
        if(p5j.arrarea.length>0){
          let lattxt='';
          let lngtxt='';
          let valtxt='';
          let numtxt='';
          let nametxt='';
          // 將資料整理到lat 跟 lng中
          p5j.arrarea.forEach((v)=>{
            // area0lat0,area0lat1,area0lat2,area0lat3|area1lat0,area1lat1,area1lat2|area2lat0,area2lat1,area2lat2,area2lat3

            v.arr.forEach((latlng)=>{
              lattxt += latlng.lat.toFixed(1).toString()+',';
              lngtxt += latlng.lng.toFixed(1).toString()+',';

            });

            lattxt = lattxt.substring(0, lattxt.length - 1);
            lattxt += '|'; // 減去最後一個chr 改為 |

            lngtxt = lngtxt.substring(0, lngtxt.length - 1);
            lngtxt += '|'; 

            valtxt += v.popup+'|';//val項內容改寫
            numtxt += 19+'|';
          });
          lattxt = lattxt.substring(0, lattxt.length - 1);
          lngtxt = lngtxt.substring(0, lngtxt.length - 1);
          valtxt = valtxt.substring(0, valtxt.length - 1);
          numtxt = numtxt.substring(0, numtxt.length - 1);
          nametxt = nametxt.substring(0, nametxt.length - 1);

          let exeurl = 'https://script.google.com/macros/s/1tWfy0ev8GpJeKpnR8b6NHtyF23Z-q38SULHIw2AIVt9a0HmYn13DRupP/exec';          
          let editurl = 'https://docs.google.com/spreadsheets/d/1K1efiDfH-h18Bb8pDEYCx1_Bqr2GLDoWFR4nV3Bxb2c/edit#gid=0';

          $.post(exeurl,{
            lat: lattxt,
            lng: lngtxt,
            val: valtxt,
            num: numtxt,
            name: nametxt,
            url: editurl,
            tag: '工作表1'
          },function(e){
            console.log(e);
        });

      }
    });
    
    p5j.keyPressed = function (e){
      console.log(e.key);
      if (e.key==='c'){
        $( "p" ).click();
        // 顯示p5j layer
      }if (e.key==='z'){
        
      }if (e.key==='u'){
        
    }if (e.key==='l'){
        
    }
  }
}
  
new p5(mapSketch, 'map');
}