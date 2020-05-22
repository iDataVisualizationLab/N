let workerQueue = {
    worker: [],
    limit: 3,
    requestQueue: [],
    add: function(content){
        let id = new Date();
        if(this.worker.length<this.limit){ // ready for add plot
            this.excute({id,content});
            return id;
        }else{
            this.requestQueue.push({id,content});
            return id;
        }
    },
    excute: function({id,content}){
        let worker = new Worker(content.path);
        worker.addEventListener('message', ({ data }) => {
            if (data.action==="done")
            {
                content.onDone({content,data});
                worker.terminate();
                this.wroker = this.wroker.filter(d=>d.id!==id);
                this.dequeue();
            }else{
                content.onProcess({content,data});
            }
        });
        let workerObj = {
            id: id,
            worker: worker
        };
        this.worker.push(workerObj)
    },
    remove: function(id){
        const current_worker_ob = this.worker.find(w=>w.id===id);
        if (current_worker_ob){
            current_worker_ob.worker.terminate();
            this.worker = this.worker.filter(d=>d.id!==id);
            this.dequeue();
        }else if(this.requestQueue.find(r=>r.id===id)){
            this.requestQueue = this.requestQueue.filter(d=>d.id!==id);
        }
    },
    dequeue: function(){
        if(this.worker.length<this.limit){ // ready for add plot
            this.excute(this.requestQueue.shift());
        }
    }
};