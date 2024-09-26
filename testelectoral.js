// variables
const parties = q['Partis politiques']
const title = q['Titre']
const questions = q['Questions']
const colors = q['Couleurs']

let finalResults = {} // will be used to show the answer at the end
let finalTotal = {}
let totalParties = Object.keys(parties).length // total political parties

// populate "final results"
for (let i in parties) {
  finalResults[i] = 0;
  finalTotal[i] = 0;
}

// prepare intro screen
$('#title').text(title)
$('#pol_number').text(totalParties)
$('#quest_number').text(questions.length)

// start the quizz
let counter = 0
$('#intro').show()
$('#start').on('click', e => {
  $('#quest').show()
  $('#intro').hide()
  $('#instructions').text('Vous pouvez sélectionner autant de réponses que vous le souhaitez')
  populateQuestion(counter)
})

// next slide
$('#pass').on('click', e => {
  nextQuestion(false)
})
$('#next').on('click', e => {
  nextQuestion(true)
})

const nextQuestion = (response = false) => {
  if (response) {
    const checked = $('#quest fieldset input:checked')
    if (checked.length) {
      for (let i = 0; i < checked.length; i++) {
        const c = checked[i]
        if (c && c.value) {
          console.log('Validated answer:', c.value)

          c.value.split(',').forEach(item => {
            finalResults[item]++
          })
        }
      }
    } else {
      console.log('Nothing selected')
      //animate
      $('#next').css('background-color','red').css('color','#fff')
      $('#next').addClass('buzz').delay(700).queue(() => $('#next').removeClass('buzz').dequeue())
      setTimeout(() => {
        $('#next').css('background-color','#fff').css('color','#111')
      }, 800)
      return
    }
  } else {
    console.log('Question skipped')
  }

  if (++counter >= questions.length) {
    showResults()
  } else {
    $('#quest fieldset').html('<legend></legend>')
    populateQuestion(counter)
  }
}

const uid = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const populateQuestion = (c = 0) => {
  let question = questions[c]['question']
  let answers = questions[c]['réponses']

  //question
  $('#quest fieldset legend').html(question)

  //propositions
  for (let i = 0; i < answers.length; i++) {
    let value = answers[i]['partis'].toString()
    let id = uid()
    let legend = answers[i].proposition
    let prop = `<input type="checkbox" name="action" id="${id}" value="${value}" /><label for="${id}">${legend}</label><br />`
    $('#quest fieldset').append(prop)

    // count here for the finalResult total
    value.split(',').forEach(item => {
      finalTotal[item]++
    })
  }
}

// when there are no more questions

const showResults = () => {
  console.log('Results', finalResults)
  $('#quest').hide()
  $('#instructions').html('Terminé&nbsp;!')
  $('#results').show()
  setTimeout(() => {
    $('#reset').show(300)
  }, 1500)

  const toRank = []
  for(let i in finalResults) {
    toRank.push({
      perc: ((finalResults[i] / finalTotal[i]) * 100),
      party: parties[i],
      color: colors[i]
    })
  }

  const rank = (items) => {
    return items.sort((a, b) => {
      if (a.perc > b.perc) {
        return -1
      }
      if (a.perc < b.perc) {
        return 1
      }
      return 0
    })
  }

  const ranked = rank(toRank)

  //chart.js
  const xValues = [] // parties
  const yValues = [] // perc
  const barColors = [] //colors
  ranked.forEach(i => {
    xValues.push(i.party)
    yValues.push(i.perc.toFixed(1))
    barColors.push(i.color)
  })

  Chart.defaults.global.defaultFontColor = '#fff'
  new Chart('final_results', {
    type: 'horizontalBar',
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    },
    options: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Partis et listes avec lesquels vous êtes le plus en accord (% total)'
      },
      scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
      }
    }
  })
}

$('#reset').on('click', e => {
  window.location.reload()
})