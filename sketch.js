let buildings = [];
let agents = [];

function setup() {
  rectMode(RADIUS);
  createCanvas(647, 400);
  
  // Create buildings
  for (let i = 0; i < 15; i++) {
    buildings.push({
      x: random(15, width / 2 - 50),
      y: random(15, width - 15),
    });
    buildings.push({
      x: random(15, width / 2 - 50),
      y: random(15, width - 15),
    });
    buildings.push({
      x: random(15, width / 2 - 50),
      y: random(15, width - 15),
    });
    buildings.push({
      x: random(width / 2 + 80, width - 25),
      y: random(25, width - 25),
    });
  }
  
  // Create agents
  for (let i = 0; i < buildings.length; i++) {
    agents.push({
      x: buildings[i].x,
      y: buildings[i].y,
      target: random(buildings)
    });
  }
}

function draw() {
  background(0, 150, 0);
  
  // Draw Thames
  noFill()
  stroke(0, 0, 255)
  strokeWeight(70)
  beginShape();
  curveVertex(width / 2, 4/4 * height);
  curveVertex(width / 2, 4/4 * height);
  curveVertex(width / 2 + 20, 3/4 * height);
  curveVertex(width / 2, 2/4 * height);
  curveVertex(width / 2 + 50, 1/4 * height);
  curveVertex(width / 2, 0/4 * height);
  curveVertex(width / 2, 0/4 * height);
  endShape();
  strokeWeight(0)
  
  //Draw Bridge
  fill(120, 80, 0)
  rect(width / 2, height / 2, 50, 20)
  
  // Draw agents
  for (let agent of agents) {
    fill(255, 200, 200);
    ellipse(agent.x, agent.y, 10);
    
    // Move towards target building
    if (agent.x < width / 2 - 50 
        && agent.target.x < width / 2 - 50) //to house
    {
          let dx = agent.target.x - agent.x;
          let dy = agent.target.y - agent.y;
          let angle = atan2(dy, dx);
          agent.x += cos(angle) * 1;
          agent.y += sin(angle) * 1;     
    }
    else if (width / 2 + 50 < agent.x 
             && width / 2 + 50 < agent.target.x) //to house
    {
          let dx = agent.target.x - agent.x;
          let dy = agent.target.y - agent.y;
          let angle = atan2(dy, dx);
          agent.x += cos(angle) * 1;
          agent.y += sin(angle) * 1;     
    }
    else if (agent.x < width / 2 - 50 
             && width / 2 + 50 < agent.target.x) //to bridge
    {
          let dx = width / 2 - 50  - agent.x;
          let dy = height / 2 - 10 - agent.y;
          let angle = atan2(dy, dx);
          agent.x += cos(angle) * 1;
          agent.y += sin(angle) * 1;     
    }
    else if (width / 2 + 50 < agent.x 
             && agent.target.x < width / 2 - 50) //to bridge
    {
          let dx = width / 2 + 50 - agent.x;
          let dy = height / 2 + 10 - agent.y;
          let angle = atan2(dy, dx);
          agent.x += cos(angle) * 1;
          agent.y += sin(angle) * 1;     
    }
    else if (agent.x < width / 2 + 50 
             && width / 2 + 50 < agent.target.x) //over bridge
    {
          let dx = width / 2 + 50  - agent.x;
          let dy = height / 2 - 10 - agent.y;
          let angle = atan2(dy, dx);
          agent.x += cos(angle) * 1;
          agent.y += sin(angle) * 1;     
    }
    else if (width / 2 - 50 < agent.x 
             && agent.target.x < width / 2 - 50) //over bridge
    {
          let dx = width / 2 - 50 - agent.x;
          let dy = height / 2 + 10 - agent.y;
          let angle = atan2(dy, dx);
          agent.x += cos(angle) * 1;
          agent.y += sin(angle) * 1;     
    }

    
    // Check if reached target building
    let d = dist(agent.x, agent.y, agent.target.x, agent.target.y);
    if (d < 5) {
      agent.target = random(buildings);
    }
  }
  
  // Draw buildings
  for (let building of buildings) {
    fill(200, 70, 70);
    square(building.x, building.y, building.x < width / 2 ? 15 : 25);
  }
}
