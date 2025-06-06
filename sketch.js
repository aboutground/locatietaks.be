let state = 0;
//0 intro with quote
//1 show 10 sec/onclick
//2 click on the river to place bridge
//3 move bridge
//4 change toll
//5 place

let colors = 
{ teal: {r: 34, g: 170, b: 152},
  yellow: {r: 244, g: 237, b: 25},
  lime: {r: 204, g: 255, b: 0},
  grey: {r: 51, g: 51, b: 51},
  orange: {r: 255, g: 87, b: 51},
  brown: {r: 139, g: 69, b: 19}
}

let time;
let river;
let canvas;

class Time {
  constructor() {
    this.time = 24;
    this.dTime = 0.08;
    this.isNewDay = false;
  }
  update() {
    this.time += this.dTime;
    if (24 <= this.time)
    {  this.isNewDay = true;
       this.time -= 24;
    }
    else
    {  this.isNewDay = false;   
    }
  }
  getHour() {
    return this.time;
  }
  drawSunlight() {
    fill(0, 0, 0, 200 * ((1 + cos(2 * PI * (this.time) / 24)) / 2) );
    rect(width / 2, height / 2, width / 2, height / 2);
  }
}

class Bridge {
  constructor(river, y) {
    this.x = river.getX(y);
    this.y = y;
    this.w = 100;
    this.h = 50;
    this.isClicked = false;
    this.toll = 0;
  }
  isClicked(x, y) {
    return this.x - this.w / 2 < x 
        && x < this.x + this.w / 2 
        && this.y - this.h / 2 < y 
        && y < this.y + this.h / 2;
  }
  draw() {
    if (this.x != null) {
      fill(colors.brown.r, colors.brown.g, colors.brown.b);
      rect(this.x, this.y, this.w / 2, this.h / 2);
      fill(colors.yellow.r, colors.yellow.g, colors.yellow.b);
      rect(this.x - 20, this.y, 5, 5);
      rect(this.x + 20, this.y, 5, 5);
      fill(0);
      textAlign(CENTER, CENTER);
      text("-", this.x - 30, this.y - 10, 20, 20);
      text("+", this.x + 10, this.y - 10, 20, 20);
      stroke(colors.grey.r, colors.grey.g, colors.grey.b, 100);
      strokeWeight(3);
      fill(255)
      textSize(14);
      textAlign(CENTER);
      text(nf(this.toll, 1, 0), this.x - 10, this.y - 10, 20, 20);
      strokeWeight(0)
    }
  }
  onMousePressed() {
    if (this.y - 5 < mouseY && mouseY < this.y + 5)
    {      if (this.x - 25 < mouseX && mouseX < this.x - 15) 
      {  if (0 < this.toll) 
         {  this.toll--;
         } 
      } 
      else if (this.x + 15 < mouseX && mouseX < this.x + 25) 
      {     this.toll++;
      }
    }
    this.isClicked = this.x - this.w / 2 < mouseX 
      && mouseX < this.x + this.w / 2 
      && this.y - this.h / 2 < mouseY 
      && mouseY < this.y + this.h / 2;
  }
}

class River {
  constructor() {
    this.xs = [
      width / 2 + 0,
      width / 2 + 0,
      width / 2 + -20,
      width / 2 + 0,
      width / 2 + 30,
      width / 2 + 0,
      width / 2 + 0
    ];
    this.bridge = null;
    this.rgb = 
      { r: round(1.2 * colors.teal.r), 
        g: round(1.2 * colors.teal.g), 
        b: round(1.5 * colors.teal.b) }
  }
  moveBridge(y)
  {  this.bridge.x = this.getX(y);
     this.bridge.y = y;
  }
  getX(y) {
    let i = floor(4 * y / height);
    return curvePoint(
      this.xs[0 + i],
      this.xs[1 + i],
      this.xs[2 + i],
      this.xs[3 + i],
      4 * y / height - i
    );
  }
  draw() {
    noFill();
    stroke(this.rgb.r, this.rgb.g, this.rgb.b);
    strokeWeight(70);
    beginShape();
    for (let i = 0; i <= 6; i++) {
      curveVertex(this.xs[i], ((i - 1) * 0.25) * height);
    }
    endShape();
    strokeWeight(0);
  }
  onMousePressed() {
    if (this.bridge)
    { this.bridge.onMousePressed();
    }
    else {
      this.draw();
      if (isPixel(mouseX, mouseY, river.rgb.r, river.rgb.g, river.rgb.b)) {
        this.bridge = new Bridge(this, mouseY);
      } 
    }
  }
}

class Contract
{ constructor(agent, work) {
    this.home = agent.home;
    this.work = work;
    this.days = random(5, 10);
    this.wage = work.wage;
  }
  draw()
  { stroke(colors.grey.r, colors.grey.g, colors.grey.b, 100);
    strokeWeight(this.days);
    line(this.home.x, 
         this.home.y, 
         this.work.x, 
         this.work.y);
    strokeWeight(3);
    fill(255)
    textSize(8);
    textAlign(CENTER, CENTER);
    text( nf(this.wage, 1, 1), 
          (this.home.x + this.work.x) / 2 - 10,
          (this.home.y + this.work.y) / 2 - 10,
          20,
          20);
  }
}

class Agent {
  constructor(home) {
    if (!Agent.all) {
      Agent.all = [];
    }
    if (!Agent.speed) {
      Agent.speed = 2.5
    }
    if (!Agent.moveCost) {
      Agent.moveCost = 0.02;
    }
    this.x = home.x;
    this.y = home.y;
    this.home = home;
    this.contract = null;
    this.goal = null;
    this.cash = 0;
    this.shift = 0;
    Agent.all.push(this);
  }
  
  update() 
  { if (time.isNewDay)
    { //Process cash
      this.home.rent = (this.home.rent + this.cash) / 2;
      this.tollPaid = false;
      if (this.cash <= 1)
      { this.contract = null;
      }   
      if (this.goal != this.home)
      {
        //Reset cash
        this.cash = 0;
        if (this.contract)
        { this.goal = this.contract.work; 
          this.contract.days--;     
          if (this.contract.days <= 0)
          { this.contract = null; 
          }
          else if ((this.contract.work.x < width / 2 
                            && width / 2 < this.x) 
                        || (this.x < width / 2 
                            && width / 2 < this.contract.work.x))
          { let distance = 100 
                    + dist(this.x, this.y, 
                           river.bridge.x, river.bridge.y) 
                    + dist(river.bridge.x, river.bridge.y, 
                           this.contract.work.x, this.contract.work.y);
            if (550 < distance)
            {  this.contract = null; 
            }      
          }   
        }
        if (!this.contract)
        { //find work
          let maxIncome = 0;
          for (let work of Work.all) 
          { let needBridge = (work.x < width / 2 && width / 2 < this.x) 
                          || (this.x < width / 2 && width / 2 < work.x);
            let distance = !needBridge 
              ? dist(this.x, this.y, work.x, work.y) 
              : river.bridge 
                ? 100 
                  + dist(this.x, this.y, river.bridge.x, river.bridge.y) 
                  + dist(river.bridge.x, river.bridge.y, work.x, work.y) 
                : null;
            if (distance
                && distance < 550) 
            { let cost = needBridge
                ? 1.5 * Agent.moveCost * distance + river.bridge.toll
                : 1.5 * Agent.moveCost * distance;
              let income = work.wage - cost - random(0, this.home.rent / 4);
              if (0 < income && maxIncome < income) 
              { maxIncome = income;
                this.goal = work;
              }
            }   
          }
        }
      }
    }  
    //move
    if (1.5 < time.getHour() 
        && this.goal) 
    { let dx = -this.x;
      let dy = -this.y;
      if (river.bridge 
          && river.bridge.x - river.bridge.w / 2 <= this.x 
          && this.x <= river.bridge.x + river.bridge.w / 2 
          && river.bridge.y - 10 <= this.y 
          && this.y <= river.bridge.y + 10) 
      { // Over bridge
        dx = this.goal.x - width / 2;
        dy = 0;
        if (0 < this.cash
            && this.tollPaid === false) {
          this.cash -= river.bridge.toll;
          this.tollPaid = true;
        }
      } else if ((this.x < width / 2 
                  && this.goal.x < width / 2) 
                 || (width / 2 < this.x 
                     && width / 2 < this.goal.x)) { // To work/home
        dx += this.goal.x;
        dy += this.goal.y;
      } else if (river.bridge
                 && this.x < river.bridge.x - river.bridge.w / 2 
                 && river.bridge.x + river.bridge.w / 2 < this.goal.x) { // To bridge
        dx += river.bridge.x - river.bridge.w / 2;
        dy += river.bridge.y - 10;
      } else if (river.bridge
                 && river.bridge.x + river.bridge.w / 2 < this.x 
                 && this.goal.x < river.bridge.x - river.bridge.w / 2) { // To bridge
        dx += river.bridge.x + river.bridge.w / 2;
        dy += river.bridge.y + 10;
      }

      let angle = atan2(dy, dx);
      this.x += cos(angle) * Agent.speed * 20 * time.dTime;
      this.y += sin(angle) * Agent.speed * 20 * time.dTime;
      
      if (0 < this.cash 
          && this.goal == this.home) {
        this.cash -= Agent.moveCost * Agent.speed * 20 * time.dTime; 
      }
                
      if (dist(this.x, this.y, this.goal.x, this.goal.y) < 5) {
        if (this.goal === this.home) {
          this.goal = null;
        } 
        else if (this.goal) //==work
        { if (this.shift === 0) {
            this.shift = time.getHour();
            this.cash += 
              this.contract
              ? this.contract.wage 
              : this.goal.wage;
            this.goal.workerAmount++;
          }
          if (23 - this.shift < time.getHour()) {
            if (!this.contract
                && this.goal.wage < this.goal.getMarginalWorkerOutput())
            { this.contract = new Contract(this, this.goal);      
            }
            this.goal = this.home;
            this.shift = 0;
          }
        }
      }
    }
  }

  draw() {
    if (this.contract)
    { this.contract.draw();
    }  
    noStroke();
    textSize(12);
    fill(colors.grey.r, colors.grey.g, colors.grey.b);
    ellipse(this.x, this.y, 10);
    if (this.goal == this.home)
    {  textAlign(LEFT, CENTER);
       text(nf(this.cash, 1, 1), this.x + 6, this.y); 
    } 
  }
}

class Work {
  constructor() {
    if (!Work.all) {
      Work.all = [];
      Work.minWage = null;
      Work.maxWage = null;
      Work.totalWage = 0;
    } 
    this.r = 25;
    //CALC X, Y
    let isOverlap = true;
    while(isOverlap)
    { isOverlap = false;
      this.x = random(this.r, width - this.r);
      this.y = random(this.r, height - this.r);
      let corners = [
        { x: this.x - this.r, y: this.y - this.r },
        { x: this.x + this.r, y: this.y - this.r },
        { x: this.x + this.r, y: this.y + this.r },
        { x: this.x - this.r, y: this.y + this.r }
      ];
      for (let corner of corners) {
        if (isPixel(corner.x, corner.y, river.rgb.r, river.rgb.g, river.rgb.b)) {
          isOverlap = true;
          break;
        }
      }
      if (!isOverlap) {
        for (let work of Work.all) {
          if (dist(this.x, this.y, work.x, work.y) < 2 * sqrt(2) * work.r) {
            isOverlap = true;
            break;
          }
        }
      }
      if (!isOverlap) {
        for (let home of Home.all) {
          if (dist(this.x, this.y, home.x, h.y) < 2 * sqrt(2) * home.r) {
            isOverlap = true;
            break;
          }
        }
      }
    }
    this.workerAmount = 0;
    this.workerOutput = random(100 * (0.3 + this.x / width) 
                          * sq(0.3 + this.x / width), 
                        100 * sq(this.x / width));
    this.dWorkerOutput = this.workerOutput / random(5, 10); //diminishing return
    this.wage = this.workerOutput - 2 * this.dWorkerOutput;
    Work.all.push(this);
    Work.totalWage += this.wage;
  }
  getMarginalWorkerOutput()
  { return this.workerOutput - this.workerAmount * this.dWorkerOutput; }
  
  update()
  { if (time.isNewDay)
    { Work.totalWage -= this.wage;

      let marginalWorkerOutput = this.workerOutput - this.workerAmount * this.dWorkerOutput;
     
      let plusWorkerOutput = this.workerOutput - (this.workerAmount + 1) * this.dWorkerOutput;

     
      if (marginalWorkerOutput < 0) // to many workers
      { this.wage -= sqrt(this.wage - 1);  
      } 
      else if (this.wage < plusWorkerOutput) // to little workers
      { this.wage = plusWorkerOutput < 1.5 * this.wage
          ? (this.wage + plusWorkerOutput) / 2
          :  1.5 * this.wage;
      }
      if (this.workerOutput - this.dWorkerOutput < this.wage)
      { this.wage = this.workerOutput - this.dWorkerOutput;
      }

      Work.totalWage += this.wage;
      this.workerAmount = 0; 
    }  
  }

  draw() {
    let r = (this.wage - Work.minWage) / (Work.maxWage - Work.minWage);
    fill(colors.orange.r - (colors.orange.r - colors.lime.r) * r,
         colors.orange.g - (colors.orange.g - colors.lime.g) * r,
         colors.orange.b - (colors.orange.b - colors.lime.b) * r); 
    square(this.x, this.y, this.r);
    stroke(colors.grey.r, colors.grey.g, colors.grey.b, 100);
    strokeWeight(3);
    fill(255)
    textSize(14);
    //text(nf(this.workerAmount, 1, 0), this.x - this.r / 2 - 2, this.y + this.r / 2 + 14);
    
    textAlign(CENTER, CENTER);
    text( nf(this.wage, 1, 1), 
          this.x - this.r / 2, 
          this.y - this.r / 2,
          this.r,
          this.r);
    //text(nf(this.workerOutput - (this.workerAmount + 1) * this.dWorkerOutput, 1, 1), this.x - this.r / 2 - 2, this.y + this.r / 2 - 17);
    strokeWeight(0);
  }
}

class Home {
  constructor() {
    if (!Agent.all) {
      Agent.all = [];
    }
    if (!Home.all) {
      Home.all = [];
      Home.minRent = 999;
      Home.maxRent = 0;      
      Home.totalRent = 0;
    }
    
    this.r = 15;
    //CALC X, Y
    let isOverlap = true;
    while(isOverlap)
    { isOverlap = false;
      this.x = random(this.r, width - this.r);
      this.y = random(this.r, height - this.r);
      let corners = [
        { x: this.x - this.r, y: this.y - this.r },
        { x: this.x + this.r, y: this.y - this.r },
        { x: this.x + this.r, y: this.y + this.r },
        { x: this.x - this.r, y: this.y + this.r }
      ];
      for (let corner of corners) {
        if (isPixel(corner.x, corner.y, river.rgb.r, river.rgb.g, river.rgb.b)) {
          isOverlap = true;
          break;
        }
      }
      if (!isOverlap) {
        for (let work of Work.all) {
          if (dist(this.x, this.y, work.x, work.y) < 2 * sqrt(2) * work.r) {
            isOverlap = true;
            break;
          }
        }
      }
      if (!isOverlap) {
        for (let home of Home.all) {
          if (dist(this.x, this.y, home.x, home.y) < 2 * sqrt(2) * home.r) {
            isOverlap = true;
            break;
          }
        }
      }
    }
    this.r = 15;
    this.rent = random(4,6);
    this.agent = new Agent(this);
    Home.all.push(this);
    Home.totalRent += this.rent;
  }
  update()
  {  
  }
 
  draw() {
    let r = (this.rent - Home.minRent) / (Home.maxRent - Home.minRent);
    fill(colors.orange.r - (colors.orange.r - colors.lime.r) * r,
         colors.orange.g - (colors.orange.g - colors.lime.g) * r,
         colors.orange.b - (colors.orange.b - colors.lime.b) * r); 
    square(this.x, this.y, this.r);
    stroke(colors.grey.r, colors.grey.g, colors.grey.b, 100);
    strokeWeight(3);
    fill(255)
    textSize(12);
    textAlign(CENTER, CENTER);
    text( nf(this.rent, 1, 1), 
          this.x - this.r / 2, 
          this.y - this.r / 2,
          this.r,
          this.r);
    strokeWeight(0);
  }
}

function isPixel(x, y, r, g, b) {
  let pixelColor = get(x, y);
  return (pixelColor[0] == r 
          && pixelColor[1] == g 
          && pixelColor[2] == b);
}

function setup() {
  rectMode(RADIUS);
  canvas = createCanvas(647, 400);
  if (document.getElementById("canvasDiv"))
  {canvas.parent(document.getElementById("canvasDiv"));}
  
  time = new Time();
  river = new River();
  Home.all = [];
  Agent.all = [];
  Work.all = [];
  
  canvas.mousePressed(() => {
    switch(state) {
      case 0:
          state = 1;
        break;
      case 1:
        river.onMousePressed();
        break;
    }
  });
  
  river.draw();
  while (Work.all.length < 7) {
    new Work();
  }
  while (Home.all.length < 30) {
    new Home();
  }
}

let buttonTime = 0;

function draw() {
  switch(state) {
    case 0:
      background(colors.yellow.r, colors.yellow.g, colors.yellow.b);
      fill(colors.grey.r, colors.grey.g, colors.grey.b);
      textSize(17)
      textAlign(CENTER);
      text("“Some years ago in London, there was a toll bar on a bridge across the Thames, and all the working people who lived on the south side of the river had to pay a daily toll of one penny for going and returning from their work. The spectacle of these poor people thus mulcted of so large a proportion of their earnings offended the public conscience, and agitation was set on foot, municipal authorities were roused, and at the cost of the taxpayers, the bridge was freed and the toll removed. All those people who used the bridge were saved sixpence a week, but within a very short time rents on the south side of the river were found to have risen about sixpence a week, or the amount of the toll which had been remitted! (...) All goes back to the land, and the landowner is able to absorb to himself a share of almost every public and every private benefit, however important or however pitiful those benefits may be.”", 20, 40, width - 40, height);
      textAlign(RIGHT);
      text("~ Winston Churchill, 1909", 0, height - 80, width - 10, height - 50);
      fill(colors.teal.r, colors.teal.g, colors.teal.b);
      buttonTime += 1;
      textSize(17 + 0.5 * cos(buttonTime / 20));
      textAlign(CENTER)
      text("<click to continue>", 0, height - 40, width - 10, height - 50);
      break;
    case 1:
      { time.update();
        if (mouseIsPressed) {
          if (river.bridge 
              && river.bridge.isClicked) {
            river.moveBridge(constrain(mouseY, 20, height - 20));
          }
        }

        // DRAW
        background(colors.teal.r, colors.teal.g, colors.teal.b);

        river.draw();
        if(river.bridge) {
          river.bridge.draw();    
        }

        for (let agent of Agent.all) {
          agent.update();
          agent.draw();
        }
        Home.minRent = 9999999;
        Home.maxRent = 0;
        for (let home of Home.all)
        { if (home.rent < Home.minRent)
          { Home.minRent = home.rent; }
          else if (Home.maxRent < home.rent)
          { Home.maxRent = home.rent; } 
        }
        for (let home of Home.all) {
          home.update();
          home.draw();
        }
        Work.minWage = 9999999;
        Work.maxWage = 0;
        for (let work of Work.all)
        { if (work.wage < Work.minWage )
          { Work.minWage = work.wage; }
          else if (Work.maxWage < work.wage)
          { Work.maxWage = work.wage; } 
        }
        for (let work of Work.all) {
          work.update();
          work.draw();
        }


        // REMOVE BROKE Agent.all
        Agent.all = Agent.all.filter(agent => agent.home.rent >= 1);
        Home.all = Home.all.filter(home => home.rent >= 1);

        time.drawSunlight() 
    }
      break;
    default:
      // code block
  }
}
