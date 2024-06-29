



var prime;
  setInterval(() => {
      let Hour = new Date().getHours();
  let Minute  = new Date().getMinutes();
  let Seconds = new Date().getSeconds();
  document.getElementById('hour').innerText = Hour.toString()
  document.getElementById('minute').innerText = Minute.toString()
  document.getElementById('second').innerText = Seconds.toString();
if (Hour < 12 ) {
  prime = "AM"
  document.getElementById('P').textContent = prime
}
else{
  prime = "PM"
  document.getElementById('P').textContent = prime
}



let day = new Date().getDate();
let month = new Date().getMonth();
let Year = new Date().getFullYear();
document.getElementById('day').textContent = day
  document.getElementById('month').textContent = (month + 1)
  document.getElementById('year').textContent = Year;

  }, 500);

  let click = document.getElementById('click');
  let menubot = document.getElementById('menubot');
  click.addEventListener('click',()=>{
         let propValue = menubot.style.getPropertyValue('display');
         if (propValue == "none") {
          menubot.style.setProperty('display','flex')
         }
         else{
          menubot.style.setProperty('display','none')
         }
  })



  let click2 = document.getElementById('click2');
  let webbot = document.getElementById('webbot');
  click2.addEventListener('click',()=>{
         let propValue = webbot.style.getPropertyValue('display');
         if (propValue == "none") {
          webbot.style.setProperty('display','flex')
         }
         else{
          webbot.style.setProperty('display','none')
         }
  })

  

   