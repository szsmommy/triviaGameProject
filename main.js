import questions from './questions.json' assert { type: 'json' }
import users from './users.json' assert { type: 'json' }

const container = document.querySelector('.container')
const usernameInput = document.getElementById('username')
const validationMsg = document.getElementById('validation-msg')
const startBtn = document.getElementById('start-btn')
const nextBtns = document.querySelectorAll('.next-question')
const playAgainBtn = document.getElementById('play-again')
const startSection = document.getElementById('start')
const currentUserDisplay = document.getElementById('user-display')
const questionGroups = document.querySelectorAll('.question')
const endSection = document.getElementById('game-end')
const finalScoreSpan = document.querySelector('span[id="score"]')
const answerButtons = document.querySelectorAll('.answer')
const questionsInModal = document.querySelectorAll('.game-question')
const userStatsItems = document.querySelectorAll('.user-stat')

const answers = [...answerButtons]

const nextSectionTriggers = [startBtn, ...nextBtns]

const sections = [startSection, ...questionGroups, endSection]

const resultsQuestions = [ ...questionsInModal ]

const resultsStats = [ ...userStatsItems ]

const questionsKeysArray = Object.keys(questions)

const usersValuesArray = Object.values(users)

const randomTen = new Set()

const gameUsers = new Set()

let currentUser

let runningScore = 0

const lastSectionIndex = sections.length - 1
let displayedSectionIndex = 0
let sectionOffset

let nextQuestionNumber = displayedSectionIndex + 1
let currentQuestion
let selectedAnswer
let correctAnswer
let userSelection = false

const currentUserDetailedResults = new Map()
currentUserDetailedResults.set("results", [])

const usersStats = new Map()
usersStats.set("stats", [])

for (const user of usersValuesArray) {
  gameUsers.add(user.username)
  usersStats.entries().next().value[1].push(user)
}


while (randomTen.size < 10) {
  const randomIndex = Math.floor(Math.random() * questionsKeysArray.length)
  const randomObjectKey = questionsKeysArray[randomIndex]
  if (randomTen.has(questions[randomObjectKey])) {
    continue;
  } else {
    randomTen.add(questions[randomObjectKey])
  }
}

const randomQuestionSet = randomTen.values()

const setStartGameInvalidState = () => {
  usernameInput.style.border = "2px solid rgb(211, 70, 70)"
  validationMsg.style.display = "block"
  startBtn.setAttribute('disabled', '')
}

const setStartGameValidState = () => {
  usernameInput.style.border = "2px solid black"
  validationMsg.style.display = "none"
  startBtn.removeAttribute('disabled')
}

const userExists = (username) => {
  if (gameUsers.has(username)) {
    return true
  } else {
    return false
  }
}

const isValid = (usernameInputValue) => {
  if (!validator.isEmpty(usernameInputValue) && validator.isLength(usernameInputValue, { min: 5 })) {
    return {
      valid: true,
      msg: null
    }
  } else {
 
    if (validator.isEmpty(usernameInputValue)) {
      return {
        valid: false,
        msg: "Required"
      }
    } else if (!validator.isLength(usernameInputValue, { min: 5 })) {
      return {
        valid: false,
        msg: "Minimum 5 characters"
      }
    } else {
      return {
        valid: false,
        msg: "Input invalid"
      }
    }
  }
}

const checkUsernameValidity = () => {
  const sanitizedInput = DOMPurify.sanitize(usernameInput.value)
  const trimmedInput = validator.trim(sanitizedInput)
  const escapedInput = validator.escape(trimmedInput)
 
  const validation = isValid(escapedInput)
  const usernameNotTaken = userExists(escapedInput)
 
  if (!validation.valid || usernameNotTaken) {
    setStartGameInvalidState()
 
    if (usernameNotTaken) {
      validationMsg.innerHTML = "Username already in use"
    } else {
      validationMsg.innerHTML = validation.msg
    }
 
  } else {
    currentUser = escapedInput
    setStartGameValidState()
  }
}

const gameEnd = () => {
  const score = runningScore.toString()
  const results = currentUserDetailedResults.entries().next().value
  const stats = usersStats.entries().next().value

  finalScoreSpan.innerHTML = score

  stats[1].push({ username: currentUser,  score: runningScore})

  const sortedStats = stats[1].sort((a, b) => (a.score < b.score) ? 1 : -1)

  resultsStats.forEach((rs, index) => {
    rs.children[0].innerHTML = sortedStats[index].username
    rs.children[1].innerHTML = sortedStats[index].score.toString()
  })

  resultsQuestions.forEach((rq, index) => {
    rq.children[1].style["font-family"] = "var(--accent-font)"
    rq.children[0].children[0].innerHTML = results[1][index].question
    rq.children[0].children[1].children[0].innerHTML = results[1][index].selectedAnswer

    rq.children[1].innerHTML = results[1][index].outcome

    if (results[1][index].outcome === "Correct") {
      rq.children[1].style.color = "green"
    } else if (results[1][index].outcome === "Incorrect") {
      rq.children[1].style.color = "var(--error-color)"
    }
  })
}

const loadQuestionAndAnswers = () => {

  if (nextQuestionNumber != lastSectionIndex) {

    currentQuestion = randomQuestionSet.next().value
    correctAnswer = currentQuestion.correctAnswer
    sections[nextQuestionNumber].children[0].innerHTML = currentQuestion["question"]
 
    const answerNodes = Array.from(sections[nextQuestionNumber].children[1].children)
 
    answerNodes.forEach((node, index) => node.children[1].innerHTML = currentQuestion["answers"][index])

    setTimeout(() => {
      container.style.background = "rgba(11, 70, 96, 0.75)"
    }, 350)
  }
}


const goToNextSection = () => {
  sections.forEach((section, loopIndex) => {
    sectionOffset = loopIndex - displayedSectionIndex
    section.style.transform = `translateX(${sectionOffset * 100}%)`
    section.style.opacity = 1
  })
}


const nextSectionClickListener = (e) => {
  if (e.target.id === "start-btn") {
    gameUsers.add(currentUser)
    currentUserDisplay.children[0].innerHTML = currentUser
    currentUserDisplay.style.display = "block"
  }

  if (correctAnswer && selectedAnswer) {
    checkAnswer(currentQuestion["question"], selectedAnswer, correctAnswer)
  }
 
  if (displayedSectionIndex === lastSectionIndex - 1) {
    userSelection = false
    displayedSectionIndex++
    gameEnd()
    goToNextSection()
   
  } else {
    loadQuestionAndAnswers()
    userSelection = false
    displayedSectionIndex++
    nextQuestionNumber++
    goToNextSection()
  }
}

nextSectionTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (e) => nextSectionClickListener(e))
})

answers.forEach((answer) => {
  answer.addEventListener('click', (e) => toggleSelectIndicator(e))
})

usernameInput.addEventListener('input', checkUsernameValidity)
usernameInput.addEventListener('blur', checkUsernameValidity)

playAgainBtn.addEventListener('click', () => window.location.reload())