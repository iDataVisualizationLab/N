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
        let day = d.getDay()+1;
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
                database.ref(`${time}/${qname}`).set({answer: qanwer, timespent:_this.survey.currentPage.timeSpent});
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
            // if (options.question.name.match("graphHolder"))
            //     renderdata(renderqueue[+options.question.name.split("_")[1]],'#chartRadar')
        });

        $("#surveyElement").Survey({
            model: _this.survey
        });
    }

    json() {
        let startPage ={
            maxTimeToFinish: 300,
            questions: [
                {
                    type: "html",
                    html: "You are about to start user study by evaluating color filter for color blinding. " +
                        "<br/>There are 23 questions in total. You will have about 5 minutes per question." +
                        "<br/>Please click on <b>'Start Survey'</b> button when you are ready."},
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

        function generateobject(useCaseNumber,category,type,correct,img) {
            const choice =[]
            for (let i=0;i<=correct+1;i++)
                choice.push(i);
            return  {
                questions: [
                    {
                        type: "dropdown",
                        name: `${useCaseNumber}_${type}`,
                        title: `How many colors are presented in this ${category}?`,
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
        questions.push(generateobject(1,'traffic lights','Potanopia', 3,'image/traficPotanopia.png'));
        questions.push(generateobject(1,'traffic lights','Potanopia', 3,'image/traficPotanopia_filtered.png'));
        questions.push(generateobject(1,'traffic lights','Deuteranopia', 3,'image/traficDeuteranopia.png'));
        questions.push(generateobject(1,'traffic lights','Deuteranopia', 3,'image/traficDeuteranopia_filtered.png'));
        questions.push(generateobject(1,'traffic lights','Tritanopia', 3,'image/traficTritanopia.png'));
        questions.push(generateobject(1,'traffic lights','Tritanopia', 3,'image/traficTritanopia_filtered.png'));
        questions.push(generateobject(1,'traffic lights','Normal', 3,'image/traficNormal.png'));

        questions.push(generateobject(2,'fruits','Potanopia', 4,'image/applePotanopia.png'));
        questions.push(generateobject(2,'fruits','Potanopia', 4,'image/applePotanopia_filtered.png'));
        questions.push(generateobject(2,'fruits','Deuteranopia', 4,'image/appleDeuteranopia.png'));
        questions.push(generateobject(2,'fruits','Deuteranopia', 4,'image/appleDeuteranopia_filtered.png'));
        questions.push(generateobject(2,'fruits','Tritanopia', 4,'image/appleTritanopia.png'));
        questions.push(generateobject(2,'fruits','Tritanopia', 4,'image/appleTritanopia_filtered.png'));
        questions.push(generateobject(2,'fruits','Normal', 4,'image/appleNormal.png'));

        questions.push(generateobject(3,'given graph','Potanopia', 4,'image/graphPotanopia.png'));
        questions.push(generateobject(3,'given graph','Potanopia', 4,'image/graphPotanopia_filtered.png'));
        questions.push(generateobject(3,'given graph','Deuteranopia', 4,'image/graphDeuteranopia.png'));
        questions.push(generateobject(3,'given graph','Deuteranopia', 4,'image/graphDeuteranopia_filtered.png'));
        questions.push(generateobject(3,'given graph','Tritanopia', 3,'image/graphTritanopia.png'));
        questions.push(generateobject(3,'given graph','Tritanopia', 3,'image/graphTritanopia_filtered.png'));
        questions.push(generateobject(3,'given graph','Normal', 4,'image/graphNormal.png'));
        questions.push(generateobject('3.2','given graph','Normal', 3,'image/graphNormal_2.png'));
        questions.unshift({
            maxTimeToFinish: 1200,
            questions: [
                {
                    type: "html",
                    name: "colorblindtest",
                    locationquestion:1,
                    html: `<p>Please complete the test below</p>
<iframe style="width: 500px;height: 428px" src="https://www.color-blindness.com/ishihara_cvd_test/ishihara_cvd_test.html?iframe=true&width=500&height=428"></iframe>`,
                },
                {
                    type: "dropdown",
                    name: "0_Normal_colorblindResult",
                    title: "Please select your corresponding result from the given test above (in <b>Test Result</b>)",
                    choices: ['none','weak','moderate','strong'],
                    correctAnswer: 'none'
                }
            ]
        });
        // questions.forEach((q,i)=>q.questions[1].name = "graphHolder_"+i);
        questions.unshift(startPage);
        questions.push(finishPage);
        return {
            title: "Timeline visualization - User study",
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

const params = {
    maxTimeToFinishPage: 300, //in seconds
    maxTimeToFinish: 300000 //in seconds
}

let userstudy = new UserStudy(params);
userstudy.init();
