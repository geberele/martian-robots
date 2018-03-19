import React from 'react'
import Table from './Table'

class Grid extends React.Component {

  /**
   * Implements constructor().
   */
  constructor (props) {
    super(props)
    this.state = {
      robots: [{
        sizeX: 0,
        sizeY: 0,
        coordinates: [],
        lost: false
      }],
      error: ''
    }

    // Bind custom functions.
    this.getGrid = this.getGrid.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.changeOrientation = this.changeOrientation.bind(this)
    this.moveRobot = this.moveRobot.bind(this)
  }

  /**
   * Handle submit.
   */
  handleSubmit (e) {
    e.preventDefault()
    try {
      var result = this.refs.theInput.value.split(/\r?\n/),
        sizeGrid = result[0].split('').filter((e) => (e.trim().length > 0)),
        coordinatesRobotStart, coordinatesRobotProgress, instructions,
        robots = [], lost, line, i

      for (line = 1; line < result.length; line += 2) {
        coordinatesRobotStart = result[line].split('').filter((e) => (e.trim().length > 0))
        coordinatesRobotProgress = []
        instructions = result[line + 1].split('').filter((e) => (e.trim().length > 0))
        lost = false

        coordinatesRobotProgress.push([
          coordinatesRobotStart[0],
          coordinatesRobotStart[1],
          coordinatesRobotStart[2]
        ])

        for (i = 0; i < instructions.length; i++) {
          if (instructions[i] == 'F') {
            var obj = this.moveRobot(coordinatesRobotProgress, sizeGrid[0], sizeGrid[1])
            coordinatesRobotProgress = obj.coordinates
            //lost = (obj.lost && this.checkScent(robots, coordinatesRobotProgress[coordinatesRobotProgress.length - 1]))
            lost = obj.lost
            if (lost) break
          } else if (instructions[i] == 'R' || instructions[i] == 'L') {
            coordinatesRobotProgress = this.changeOrientation(instructions[i], coordinatesRobotProgress)
          }
        }

        robots.push({
          sizeX: sizeGrid[0],
          sizeY: sizeGrid[1],
          coordinates: coordinatesRobotProgress,
          lost: lost
        })

      }

      this.setState({
        robots: robots
      })

    } catch(e) {
      this.setState({error: 'Error: Data inserted not correct.'})
      console.log('Error: ' + e.message)
      console.log(e)
    }
  }

  /**
   * Populate the grid.
   *
   * @param {array} robot
   * @returns {array}
   */
  getGrid(robot) {
    const {sizeY, sizeX, coordinates} = robot

    let table = [], row = [], x, y, z, value

    for (x = sizeX - 1; x > -1; x--) {
      row = []
      for (y = 0; y < sizeY; y++) {
        value = 0

        for (z = 0; z < coordinates.length; z++) {
          if (x == coordinates[z][0] && y == coordinates[z][1]) {
            value = coordinates[z][2]
            break
          }
        }
        row.push(value)
      }
      table.push(row)
    }
    return table
  }

  /**
   * Change the orientation of the robot.
   *
   * @param {string} instruction
   * @param {array} coordinates
   * @returns {array}
   */
  changeOrientation(instruction, coordinates) {
    if (coordinates.length < 0) return coordinates

    var orientation = coordinates[coordinates.length - 1][2],
      newOrientation

    if (orientation == 'N' && instruction == 'R') newOrientation = 'W'
    else if (orientation == 'W' && instruction == 'R') newOrientation = 'S'
    else if (orientation == 'S' && instruction == 'R') newOrientation = 'E'
    else if (orientation == 'E' && instruction == 'R') newOrientation = 'N'
    else if (orientation == 'N' && instruction == 'L') newOrientation = 'E'
    else if (orientation == 'E' && instruction == 'L') newOrientation = 'S'
    else if (orientation == 'S' && instruction == 'L') newOrientation = 'W'
    else if (orientation == 'W' && instruction == 'L') newOrientation = 'N'

    if (newOrientation) {
      coordinates[coordinates.length - 1][2] = newOrientation
    }

    return coordinates
  }

  /**
   * Move the robot.
   *
   * @param {array} coordinates
   * @param {int} sizeX
   * @param {int} sizeY
   * @returns {{coordinates: *, lost: boolean}}
   */
  moveRobot(coordinates, sizeX, sizeY) {
    if (coordinates.length < 0) return {coordinates: coordinates, lost: false}

    var lastElement = coordinates[coordinates.length - 1],
      newElement = [],
      lost = false

    if (lastElement[2] == 'N' && (parseInt(lastElement[0]) + 1) < parseInt(sizeX)) {
      newElement = [
        parseInt(lastElement[0]) + 1,
        lastElement[1],
        lastElement[2]
      ]
    }
    else if (lastElement[2] == 'W' && (parseInt(lastElement[1]) + 1) < parseInt(sizeY)) {
      newElement = [
        lastElement[0],
        parseInt(lastElement[1]) + 1,
        lastElement[2]
      ]
    }
    else if (lastElement[2] == 'S' && (parseInt(lastElement[0]) - 1) > -1) {
      newElement = [
        parseInt(lastElement[0]) - 1,
        lastElement[1],
        lastElement[2]
      ]
    }
    else if (lastElement[2] == 'S' && (parseInt(lastElement[1]) - 1) > -1) {
      newElement = [
        lastElement[0],
        parseInt(lastElement[1]) - 1,
        lastElement[2]
      ]
    } else {
      lost = true
    }

    if (newElement.length) {
      coordinates.push(newElement)
    }

    return {coordinates: coordinates, lost: lost}
  }

  /**
   * Check if a previous robot moved "off" an edge of the grid.
   *
   * @param {array} robots
   * @param {array} lastCoordinatesRobot
   * @returns {boolean}
   */
  checkScent(robots, lastCoordinatesRobot) {
    robots.forEach((robot) => {
      let lastStep = robot.coordinates[robot.coordinates.length - 1]
      if (!robot.lost && JSON.stringify(lastStep) == JSON.stringify(lastCoordinatesRobot)) return true
    })
    return false
  }

  /**
   * Implements render().
   */
  render () {
    const {error, robots} = this.state
    let results = [], item = 0

    robots.forEach((robot) => {
      let data = this.getGrid(robot)
      if (data.length > 0) {
        results[item] = (
          <div key={item}>
            <h3>Robot {item + 1}</h3>
            <Table data={data} />
            <div>Start: {robot.coordinates[0]}</div>
            <div>End: {robot.coordinates[robot.coordinates.length - 1]}</div>
            {robot.lost && <div>LOST</div>}
          </div>
        )
        item++
      }
    })

    return (
      <div>
        <h1>Martian Robots</h1>
        <form>
          <textarea ref="theInput"></textarea>
          <button type="submit" onClick={this.handleSubmit}>Start</button>
        </form>
        {error}
        <br />
        {results}
      </div>

    )
  }
}

export default Grid
