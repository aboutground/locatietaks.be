let bridge = {};
let toll;

let homes = [];
let homeIndex = 0;
let houseR = 15;
let villaR = 25;
let totalRent = 1;

let agents = [];
let speed = 5;

let canvas;

function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function windowResized() {
  centerCanvas();
}

function setup() 
{ rectMode(RADIUS);
  let canvas = createCanvas(647, 400);
  centerCanvas();
  canvas.parent(document.getElementById("canvasDiv"));
 
  bridge = {x: width/2, y: height/2, w: 100, h: 50 };
  
  toll = createSlider(0, 2000);
  toll.parent(canvas);
  toll.position(10, 10);
  toll.size(80);
 
  // Create buildings
  let houses = [];
  while (houses.length < 30)
  { let house = 
    { x: random(houseR, width / 2 - bridge.w),
      y: random(houseR, height - 2 * houseR),
      rent: 0,
      wage: 1 + random(0, 0.5)
    }
    let overlap = false;
    for (let i = 0; i < houses.length; i++) 
    { if (dist(house.x, house.y, houses[i].x, houses[i].y) < 2 * houseR)
      { overlap = true;
        break;
      }
    }
    if(overlap == false)
    { houses.push(house);    
    }   
  }
  for (let house of houses)
  { homes.push(house);  
  } 
  let villas = [];
  while (villas.length < 5)
  { let villa = 
    { x: random(width / 2 + bridge.w, width - villaR),
      y: random(villaR, height - villaR),
      rent: 0,
      wage: 1.5 + random(0, 1)
    }
    let overlap = false;
    for (let i = 0; i < villas.length; i++) 
    { if (dist(villa.x, villa.y, villas[i].x, villas[i].y) < 2 * villaR)
      { overlap = true;
        break;
      }
    }
    if (overlap == false)
    { villas.push(villa);    
    }  
  }
  for (let villa of villas)
  { homes.push(villa);  
  }
  
  // Create agents
  for (let i = 0; i < homes.length; i++) 
  { agents.push({
        x: homes[i].x,
        y: homes[i].y,
        home: homes[i],
        work: homes[i],
        wage: 0,     
      });
  }
}

function draw() 
{
  background(0, 150, 0);
  
  // Draw Thames
  noFill()
  stroke(0, 0, 255)
  strokeWeight(70)
  beginShape();
  curveVertex(width / 2, 0);
  curveVertex(width / 2, 0);
  curveVertex(width / 2 + 50, 0.25 * height);
  curveVertex(width / 2, 0.5 * height);
  curveVertex(width / 2 + 20, 0.75 * height);
  curveVertex(width / 2, height);
  curveVertex(width / 2, height);
  endShape();
  strokeWeight(0);
  
  if (mouseIsPressed)
  { if (bridge.x - bridge.w / 2 < mouseX 
        && mouseX < bridge.x + bridge.w / 2
        && bridge.y - bridge.h / 2 < mouseY
        && mouseY < bridge.y + bridge.h / 2)
    {
      bridge.y = mouseY;
      if (bridge.y / height < 0.25)
      { bridge.x = curvePoint(
          width / 2,
          width / 2,
          width / 2 + 50,
          width / 2,
          4 * bridge.y / height)
      }
      else if (bridge.y / height < 0.5)
      { bridge.x = curvePoint(
          width / 2,
          width / 2 + 50,
          width / 2,
          width / 2 + 20,
          4 * bridge.y / height - 1)
      }
      else if (bridge.y / height < 0.75)
      { bridge.x = curvePoint(
          width / 2 + 50,
          width / 2,
          width / 2 + 20,
          width / 2,
          4 * bridge.y / height - 2)
      }
      else
      { bridge.x = curvePoint(
          width / 2,
          width / 2 + 20,
          width / 2,
          width / 2,
          4 * bridge.y / height - 3)
      }
    }
  }
  
  //Draw Bridge
  fill(120, 80, 0)
  rect(bridge.x, bridge.y, bridge.w/2, bridge.h/2)

  
  // Draw agents
  for (let agent of agents) {
    fill(255, 200, 200);
    ellipse(agent.x, agent.y, 10);
    let dx = - agent.x;
    let dy = - agent.y;
    
    // Move towards work building
    if (agent.x < bridge.x - bridge.w /2 
        && agent.work.x < bridge.x - bridge.w /2 ) //to work/home
    { dx += agent.work.x;
      dy += agent.work.y;
    }
    else if (bridge.x + bridge.w /2 < agent.x 
             && bridge.x + bridge.w /2 < agent.work.x) //to work/home
    { dx += agent.work.x;
      dy += agent.work.y;   
    }
    else if (agent.x < bridge.x - bridge.w /2 
             && bridge.x + bridge.w /2 < agent.work.x) //to bridge
    { dx += bridge.x - bridge.w /2;
      dy += bridge.y - 10;    
    }
    else if (bridge.x + bridge.w /2 < agent.x 
             && agent.work.x < bridge.x - bridge.w /2) //to bridge
    { dx += bridge.x + bridge.w /2;
      dy += bridge.y + 10;  
    }
    else if (agent.x < bridge.x + bridge.w /2
             && bridge.x + bridge.w /2 < agent.work.x) //over bridge
    { dx += bridge.x + bridge.w /2;
      dy += bridge.y - 10;  
    }
    else if (bridge.x - bridge.w /2 < agent.x 
             && agent.work.x < bridge.x - bridge.w /2) //over bridge
    { dx += bridge.x - bridge.w /2;
      dy += bridge.y + 10;
    }  
    let angle = atan2(dy, dx);
    agent.x += cos(angle) * speed;
    agent.y += sin(angle) * speed;    

    
    // Check if reached work building
    let d = dist(agent.x, agent.y, agent.work.x, agent.work.y);
    if (d < 5) 
    {
      if (agent.work == agent.home)
      { agent.home.rent += agent.wage; 
        agent.wage = 0;
        while(agent.work == agent.home)
        {agent.work = random(homes)}
        for (let i = 0; i < homes.length; i++)
        { let wage = homes[i].wage;
          let cost = 
              (((homes[i].x < width/2 && agent.x < width/2) 
            || (homes[i].x > width/2 && agent.x > width/2)) 
            ? (dist(agent.x, agent.y, homes[i].x, homes[i].y)) 
            : (dist(agent.x, agent.y, bridge.x, bridge.y) 
               + dist(bridge.x, bridge.y, homes[i].x, homes[i].y)
               + toll.value())) / 761;
          if (homes[i] != agent.home 
              && agent.wage < wage - cost)
          {  agent.wage = wage - cost;
             agent.work = homes[i];
          }
        } 
      }
      else //agent arives at work
      { agent.work.wage += random(-0.5, +0.5);
        agent.work.wage *= 0.9
        if (agent.work.wage < (agent.work.x < width/2 ? 1 : 1.5))
          agent.work.wage = (agent.work.x < width/2 ? 1 : 1.5);
        agent.work = agent.home;      
      }
    }
  }
  
  // Draw buildings
  totalRent = 1;
  for (let home of homes) {
    home.rent *= 0.9999;
    totalRent += home.rent }
  for (let home of homes) {
    fill(5000 * home.rent / totalRent, 70, 70);
    square(home.x, home.y, home.x < width / 2 ? 15 : 25);
  }
}
