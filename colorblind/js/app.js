const database = firebase.database();

class UserStudy {
    constructor(params) {
        this.maxTimeToFinishPage = params.maxTimeToFinishPage;
        this.maxTimeToFinish = params.maxTimeToFinish;
    }

    init() {
        let _this = this;
        let d = new Date();
        let month = d.getMonth()+1;
        let day = d.getDate()+1;
        let h = d.getHours();
        let m = d.getMinutes();
        let second = d.getSeconds();
        let time = `${month}_${day}_${h}_${m}_${second}`;
        let uuid = this.uuidv4();
        let json = this.json();
        let renderqueue = json.pages.filter(p=>p.questions[1].extraData).map(d=>d.questions[1].extraData);
        _this.survey = new Survey.Model(json);
        _this.survey
            .onComplete
            .add(function (result) {
                let val = _this.survey.currentPage.getValue();
                Object.keys(val).forEach(key=>{
                    let qname =key;
                    let qanwer = val[qname];
                    database.ref(`${time}/${qname}`).set({answer: qanwer, timespent:_this.survey.currentPage.timeSpent});
                })

            });
        _this.survey.onCurrentPageChanging.add(function (sender, options) {
            // console.log(`Page changing: `+ survey.currentPage.timeSpent)
            let val = _this.survey.currentPage.getValue();
            Object.keys(val).forEach(key=>{
                let qname =key;
                let qanwer = val[qname];
                // let locationquestion = _this.survey.currentPage.questions[0].locationquestion||0;
                const correct = _this.survey.getQuestionByName(qname).correctAnswer;
                let answer = {answer: qanwer, timespent:_this.survey.currentPage.timeSpent};
                if (correct!==undefined)
                    answer.correctAnswer = correct;
                database.ref(`${time}/${qname}`).set(answer);
                // console.log({answer: qanwer, timespent:_this.survey.currentPage.timeSpent, correct: _this.survey.currentPage.questions[0].correctAnswer})
            })
        });
        _this.survey.onTimerPanelInfoText.add((sender, options) => {
            if (sender.currentPage.isReadOnly) {
                options.text = '';
            } else {
                options.text = `Remaining time in seconds: ${300 -_this.survey.currentPage.timeSpent} `;
            }
        });

        _this.survey.onAfterRenderQuestion.add(function(survey, options){
            if (options.question.name==='colorblind_start')
            {
                renderColorBlindTest(time);
            }
            //     renderdata(renderqueue[+options.question.name.split("_")[1]],'#chartRadar')
        });
        // _this.survey.onAfterRenderPage.add(function(survey, options){
        //     debugger
        //     // if (options.page.data.isFirstPage)
        //     // {
        //     //     renderColorBlindTest();
        //     // }
        // });

        $("#surveyElement").Survey({
            model: _this.survey
        });
    }

    json() {
        let startPage ={
            name:'start',
            maxTimeToFinish: 300,
            questions: [
                {
                    type: "html",
                    html: `You are about to start user study by evaluating color filter for color blinding.
                        <br/>There are 22 questions in total. You will have about 5 minutes per question.
                        <br/>Before start please complete the color blindness test below`},

                {
                    name:'colorblind_start',
                    type: "html",
                    html: "<b id='colorblind_i'>For each image you have to enter the number you can see. If you don't see anything just leave the input field empty.</b><br/><div id='colorblind_start'></div>"},
                {
                    name:'instruction',
                    type: "html",
                    html: "<p id='instrunction' >Please click on <b>'Start Survey'</b> button when you are ready.</p>"},
                {
                    type: "html",
                    html: "Consent notice: The purpose of this study is to gather user's feedback to evaluate a visualization design. No personal information is collected and all user's reponses are confidential and anonymous"
                },

            ]
        }
        let finishPage ={
            maxTimeToFinish: 300,
            questions: [
                {
                    type: "comment",
                    name: "suggestions",
                    title: "What is your opinion about each visual design, which one do you prefer? and why"
                },
                {
                    type: "radiogroup",
                    name: "gender",
                    title: "What is your gender?",
                    choices:['Male','Female','Prefer not to say']
                },
                {
                    type: "radiogroup",
                    name: "degree",
                    title: "What is your current degree?",
                    choices:['Undergraduate','Master','PhD','Other']
                }
            ]
        };
        function shuffle(array){
            array.sort(() => Math.random() - 0.5);

        }

        function generateobject(useCaseNumber,prefix,category,type,correct,img) {
            const choice =[]
            for (let i=0;i<=correct+1;i++)
                choice.push(i);
            return  {
                questions: [
                    {
                        type: "dropdown",
                        name: `${useCaseNumber}_${type}`,
                        title: `How many colors are presented in ${prefix} ${category}?`,
                        choices: choice,
                        correctAnswer: correct,
                    },
                    {
                        type: "html",
                        name: "graphHolder",
                        html: `<img src="${img}"></img>`,
                    }
                ]
            }
        }


        var questions = [];
        questions.push(generateobject(1,'these','lights','Potanopia', 3,'image/traficPotanopia.png'));
        questions.push(generateobject(1,'these','lights','Potanopia', 3,'image/traficPotanopia_filtered.png'));
        questions.push(generateobject(1,'these','lights','Deuteranopia', 3,'image/traficDeuteranopia.png'));
        questions.push(generateobject(1,'these','lights','Deuteranopia', 3,'image/traficDeuteranopia_filtered.png'));
        questions.push(generateobject(1,'these','lights','Tritanopia', 3,'image/traficTritanopia.png'));
        questions.push(generateobject(1,'these','lights','Tritanopia', 3,'image/traficTritanopia_filtered.png'));
        questions.push(generateobject(1,'these','lights','Normal', 3,'image/traficNormal.png'));

        questions.push(generateobject(2,'these','fruits','Potanopia', 4,'image/applePotanopia.png'));
        questions.push(generateobject(2,'these','fruits','Potanopia', 4,'image/applePotanopia_filtered.png'));
        questions.push(generateobject(2,'these','fruits','Deuteranopia', 4,'image/appleDeuteranopia.png'));
        questions.push(generateobject(2,'these','fruits','Deuteranopia', 4,'image/appleDeuteranopia_filtered.png'));
        questions.push(generateobject(2,'these','fruits','Tritanopia', 4,'image/appleTritanopia.png'));
        questions.push(generateobject(2,'these','fruits','Tritanopia', 4,'image/appleTritanopia_filtered.png'));
        questions.push(generateobject(2,'these','fruits','Normal', 4,'image/appleNormal.png'));

        questions.push(generateobject(3,'this','graph','Potanopia', 4,'image/graphPotanopia.png'));
        questions.push(generateobject(3,'this','graph','Potanopia', 4,'image/graphPotanopia_filtered.png'));
        questions.push(generateobject(3,'this','graph','Deuteranopia', 4,'image/graphDeuteranopia.png'));
        questions.push(generateobject(3,'this','graph','Deuteranopia', 4,'image/graphDeuteranopia_filtered.png'));
        questions.push(generateobject(3,'this','graph','Tritanopia', 3,'image/graphTritanopia.png'));
        questions.push(generateobject(3,'this','graph','Tritanopia', 3,'image/graphTritanopia_filtered.png'));
        questions.push(generateobject(3,'this','graph','Normal', 4,'image/graphNormal.png'));
        questions.push(generateobject('3','this','graph_2','Normal', 3,'image/graphNormal_2.png'));
        // questions.forEach((q,i)=>q.questions[1].name = "graphHolder_"+i);
        questions.unshift(startPage);
        questions.push(finishPage);
        return {
            title: "Color - User study",
            showProgressBar: "bottom",
            showTimerPanel: "top",
            showTimerPanelMode: "page",
            maxTimeToFinishPage: this.maxTimeToFinishPage,
            maxTimeToFinish: this.maxTimeToFinish,
            firstPageIsStarted: true,
            startSurveyText: "Start Survey",
            pages: questions,
            completedHtml: "<h4>You have finished user study section, thank you very much for your time.</h4>"
        };
    }

    uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
}
function renderColorBlindTest(time){
    const contain = d3.select('#colorblind_start');
    const qholder= contain.append('div').attr('class','cQuestion').style('display','none');
    contain
        .append('input')
        .attr('type','button')
        .attr('value','Start colorblind test')
        .style('margin-left','50%')
        .style('transform','translateX(-50%)')
        .on('click',function(){
            d3.select(this).style('display','none');
            d3.select('input[value=Submit]').style('display','block');
            qholder.style('display','flex');
        });

    const div = qholder.selectAll('div.colorblind')
        .data([{img:'image/c1.jpg',correctAnswer:8},
            {img:'image/c2.jpg',correctAnswer:12},
            {img:'image/c3.jpg',correctAnswer:5},
            {img:'image/c4.jpg',correctAnswer:2},
            {img:'image/c5.jpg',correctAnswer:73},
            {img:'image/c6.jpg',correctAnswer:42}]).enter()
        .append('div')
        .attr('class','colorblind')
        .style('width','225px');
    div.append('img')
        .attr('width','225px')
        .attr('src',d=>d.img);
    div.append('input')
        .attr('type','number');
    const result = contain.append('b');
    contain
        .append('input')
        .attr('type','button')
        .attr('value','Submit')
        .style('margin-left','50%')
        .style('transform','translateX(-50%)')
        .style('display','none')
        .on('click',function(){
            d3.select(this).style('display','none');
            d3.select('#colorblind_i').style('display','none');
            qholder.style('display','none');
            let correct = 0;
            div.select('input').each(function(d){
                if (+$(this).val()===d.correctAnswer)
                    correct++;
            });
            database.ref(`${time}/0_Normal_colorblind`).set({answer: correct, timespent:0, correctAnswer:6});
            result.text(`Thank you for finish the color blind test. Correct answer ${correct}/6`).style('display','block');
            d3.select('#instrunction').classed('show',true);
            d3.select('input[value="Start Survey"]').classed('show',true);
        });
}

const params = {
    maxTimeToFinishPage: 300, //in seconds
    maxTimeToFinish: 300000 //in seconds
}

let userstudy = new UserStudy(params);
userstudy.init();
