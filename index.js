var fs = require('fs');
var { promisify } = require('util');
var logUpdate = require('log-update');
var toX = () => 'X';
var writeFile = promisify(fs.writeFile);
var beep = () => process.stdout.write("\x07");
var readdir = promisify(fs.readdir);
var delay = (seconds) => new Promise( (resolves) => {
    setTimeout(resolves, seconds*1000);
})


// Log concurrent tasks

var tasks = [
    delay(4),
    delay(6),
    delay(4),
    delay(3),
    delay(5),
    delay(7),
    delay(9),
    delay(3),
    delay(10),
    delay(5)
];

class PromiseQueue {

    constructor(promises=[], concurrentCount=1) {
        this.concurrent = concurrentCount;
        this.total = promises.length;
        this.todo = promises;
        this.running = [];
        this.complete = [];
    }

    get runAnouther() {
        return (this.running.length < this.concurrent) && this.todo.length;
    }

    graphTasks() {
        var { todo, running, complete } = this;
        logUpdate(`

            todo: [${todo.map(toX)}]
            running: [${running.map(toX)}]
            complete: [${complete.map(toX)}]

        `)
    }

    run() {
        while(this.runAnouther) {
            var promise = this.todo.shift();
            promise.then( () => {
                this.complete.push(this.running.shift());
                this.graphTasks();
                this.run();
            })
            this.running.push(promise);
            this.graphTasks();

        }

    }

}

var delayQueue = new PromiseQueue(tasks, 2);
delayQueue.run();
