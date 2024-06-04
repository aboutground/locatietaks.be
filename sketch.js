let riverXs = [];
let bridge = null;
let bridgeClicked = false;
let toll;

let works = [];
let homes = [];
let homeIndex = 0;
let totalWage = 1;
let totalRent = 1;

let agents = [];
let speed = 2;
let time = 0;

let canvas;

function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function windowResized() {
  centerCanvas();
}

function DrawRiver()
{ noFill()
  stroke(0, 0, 255)
  strokeWeight(70)
  beginShape();
  for (let i = 0; i <= 6; i++)
  { curveVertex(riverXs[i], ((i - 1) * 0.25) * height); 
  }
  endShape();
}

function getBridgeX(y)
{  let i = floor(4 * y / height); 
   return curvePoint(
      riverXs[0 + i],
      riverXs[1 + i],
      riverXs[2 + i],
      riverXs[3 + i],
      4 * y / height - i)
}

function isPixel(x, y, r, g, b)
{ let pixelColor = get(x, y);
  return (pixelColor[0] == r 
          && pixelColor[1] == g 
          && pixelColor[2] == b) 
}

function setup() 
{ rectMode(RADIUS);
  canvas = createCanvas(647, 400);
  centerCanvas();
  canvas.parent(document.getElementById("canvasDiv"));
  canvas.mousePressed(()=>
  {  if (isPixel(mouseX, mouseY, 0, 0, 255))
     { bridge = {x: getBridgeX(mouseY), y: mouseY, w: 100, h: 50 };   
     }
     else
     { if(bridge) bridgeClicked = 
         bridge.x - bridge.w / 2 < mouseX 
      && mouseX < bridge.x + bridge.w / 2
      && bridge.y - bridge.h / 2 < mouseY
      && mouseY < bridge.y + bridge.h / 2;
     }

  });
  
  toll = createSlider(0, 10, 0);
  toll.parent(canvas);
  toll.position(20, -20);
  toll.size(80);

  // Draw Thames
  riverXs =   
    [width / 2 + 0,
     width / 2 + 0, 
     width / 2 + -20, 
     width / 2 + 0, 
     width / 2 + 30,
     width / 2 + 0,
     width / 2 + 0]
   DrawRiver();
  
 //per work
  while (works.length < 10)
  { let workX = random(25, width - 25);
   let work = 
    { x: workX,
      y: random(25, height - 25),   
      r: 25,
      wage: random(5, workX / 5)
    }
    let isOverlap = false;
    let corners = [
        {x: work.x - work.r, y: work.y - work.r},
        {x: work.x + work.r, y: work.y - work.r},
        {x: work.x + work.r, y: work.y + work.r},
        {x: work.x - work.r, y: work.y + work.r}
      ];
    for (let corner of corners) 
    { if (isPixel(corner.x, corner.y, 0, 0, 255)) 
      { isOverlap = true;
        break;
      }
    }   
    if(isOverlap == false)
    { for (let w of works) 
      { if (dist(work.x, work.y, w.x, w.y) < 3 * work.r)
        { isOverlap = true;
          break;
        }
      }
    }   
    if(isOverlap == false) 
    {  works.push(work);   
    }  
  }
 
  //per house
  let home = [];
  while (homes.length < 20)
  { let home = 
    { x: random(15, width - 15),
      y: random(15, height - 15),    
      r: 15,
      rent: 5,
    }
    let isOverlap = false;
    let corners = [
        {x: home.x - 2 * home.r, y: home.y - 2 * home.r},
        {x: home.x + 2 * home.r, y: home.y - 2 * home.r},
        {x: home.x + 2 * home.r, y: home.y + 2 * home.r},
        {x: home.x - 2 * home.r, y: home.y + 2 * home.r}
      ];
    for (let corner of corners) 
    { if (isPixel(corner.x, corner.y, 0, 0, 255)) 
      { isOverlap = true;
        break;
      }
    }  
    if(isOverlap == false)
    { for (let w of works) 
      { if (dist(home.x, home.y, w.x, w.y) < 3 * w.r)
        { isOverlap = true;
          break;
        }
      }
    }
    if(isOverlap == false)
    { for (let h of homes) 
      { if (dist(home.x, home.y, h.x, h.y) < 3 * home.r)
        { isOverlap = true;
          break;
        }
      }
    }   
    if(isOverlap == false) 
    {  homes.push(home);   
       agents.push({
          x: home.x,
          y: home.y,
          home: home,
          goal: home,
          cash: 0,
          time: 0,
        });
    }  
  }
}

function draw() 
{ time++;
  if (mouseIsPressed)
  { if (bridgeClicked)
    { bridge.x = getBridgeX(mouseY);
      bridge.y = mouseY;
    }
  }
  for (let agent of agents) 
  { agent.time += 0.02;
   if (dist(agent.x, agent.y, agent.goal.x, agent.goal.y) < 5) 
    { if (agent.goal == agent.home)
      { if (0 < agent.cash) //agent arives home after work
        { agent.home.rent = 
            (agent.home.rent + agent.cash / agent.time) / 2; 
          agent.cash = 0;     
          agent.time = 0;
        }
        let maxHourlyWage = 0;
        for (let work of works)
        { let isSameSide = 
              (work.x < width/2 && agent.x < width/2) 
           || (work.x > width/2 && agent.x > width/2);
          let distance =
            isSameSide
            ? dist(agent.x, agent.y, work.x, work.y)
            : bridge
              ? dist(agent.x, agent.y, bridge.x, bridge.y) 
                + dist(bridge.x, bridge.y, work.x, work.y)
              : null;
          if (distance)
          { distance *= 0.005;
            let t = distance;
            let cost = 0.1 * distance + !isSameSide * toll.value();        
            let hourlyWage = ( work.wage - cost ) / t; 
            if (maxHourlyWage < hourlyWage)
            {  maxHourlyWage = hourlyWage;
               agent.cash = work.wage - cost;
               agent.goal = work;
            }
          }
        } 
      }
      else //agent arives at work
      { agent.goal.wage *= random(0.99, 1);
        agent.goal = agent.home;      
      }
    }
    
    if (agent.goal)
    { let dx = - agent.x;
      let dy = - agent.y;
      if (bridge != null
          && bridge.x - bridge.w /2 <= agent.x 
          && agent.x <= bridge.x + bridge.w /2
          && bridge.y - 10 <= agent.y
          && agent.y <= bridge.y + 10) //over bridge
      { dx = agent.goal.x - width / 2;
        dy = 0;  
      }
      else if ((agent.x < width /2 
           && agent.goal.x < width /2 )
       || (width / 2 < agent.x 
           && width /2 < agent.goal.x)) //to work/home        
      { dx += agent.goal.x;
        dy += agent.goal.y;
      }
      else if (bridge != null
               && agent.x < bridge.x - bridge.w /2 
               && bridge.x + bridge.w /2 < agent.goal.x) //to bridge
      { dx += bridge.x - bridge.w /2;
        dy += bridge.y - 10;    
      }
      else if (bridge != null
               && bridge.x + bridge.w /2 < agent.x 
               && agent.goal.x < bridge.x - bridge.w /2) //to bridge
      { dx += bridge.x + bridge.w /2;
        dy += bridge.y + 10;  
      }
    
      let angle = atan2(dy, dx);
      agent.x += cos(angle) * speed;
      agent.y += sin(angle) * speed;   
    }
  }
 
  //wage calulation
  for (let work of works)
  { work.wage *= random(0.99, 1.01); 
    totalWage += work.wage;
  }
  
  //rent calculation
  totalRent = 1;
  for (let home of homes)
  { home.rent *= 0.9999;
    totalRent += home.rent 
  }
 
  agents = agents.filter(agent => 1 <= agent.home.rent)
  homes = homes.filter(home => 1 <= home.rent)
 
  //DRAW
  background(0, 150, 0); 
  DrawRiver();  
  strokeWeight(0);  
  if (bridge != null)  
  {  fill(120, 80, 0);
     rect(bridge.x, bridge.y, bridge.w/2, bridge.h/2);
     fill(255)
     text(nf(toll.value(), 1, 1), bridge.x - 2, bridge.y - 3);
  } 
 
  for (let agent of agents) 
  { fill(255, 200, 200);
    ellipse(agent.x, agent.y, 10);
  }  

  for (let home of homes) 
  { fill(5000 * home.rent / totalRent, 70, 70);
    square(home.x, home.y, home.r);
    fill(255)
    text(nf(home.rent, 1, 1), home.x - home.r /2 - 2, home.y + home.r / 2 - 3);
  } 
  for (let work of works) 
  { fill(70, 5000 * (work.wage / totalWage), 70);
    square(work.x, work.y, work.r);
    fill(255)
    text(nf(work.wage, 1, 1), work.x - work.r /2 - 2, work.y + work.r / 2 - 3);
  }
}
