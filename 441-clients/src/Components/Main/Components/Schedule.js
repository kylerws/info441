import React from 'react'
import moment from 'moment'
import { Button, Col, Container, Row, Jumbotron, Card } from 'react-bootstrap'


import { days, times, dayIDs } from '../../../constants/AvailabilityTypes'

const borderStyle = '1px solid #cfcfcf'

const Schedule = ({schedule, height }) => {
  
  let style = {
    border: borderStyle,
    borderRadius: '5px'
  }

  let scrollContainerStyle={
    height: height ? height : '25rem',
    paddingLeft: '1rem',
    paddingRight: '4px',
    paddingTop: '1.5rem',
    marginRight: '3px',
    marginBottom: '3px'
  }

  let gridContainerStyle={
    position: 'relative'
  }

  const cellHeight = 2
  const timeColWidth = 2.5
  const tickLength = .5
  const timeFontSize = .7

  const dayCols = days.map(d => {
    return <DayCol day={d.abbr} times={times} key={d.id} cellHeight={cellHeight} top={tickLength} />
  })

  return <div className="scheduleContainer" style={style}>
    <ScheduleHeader days={days.map(d => d.abbr)} height={3} timeColWidth={timeColWidth + 1}/>
    <div style={scrollContainerStyle} className="scrollContainer">
      
      <Row className="w-100 mx-0 p-0" style={gridContainerStyle}>
        
        <TimeSlotGrid
          schedule={schedule}
          height={times.length * cellHeight}
          timeOffset={timeColWidth}
          cellHeight={cellHeight} />
        <TimeCol
          times={times}
          width={timeColWidth}
          cellHeight={cellHeight}
          top={tickLength}
          fontSize={timeFontSize} />
        {dayCols}
        
      </Row>
    </div>
  </div>
}

const TimeSlotGrid = ({ schedule, height, timeOffset, cellHeight }) => {
  console.log(schedule)
  const style = {
    height: height + 'rem',
    flexBasis: '1',
    flexGrow: '1',
    maxWidth: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: '1',
    top: '0.5rem',
    paddingLeft: timeOffset + 'rem'
  }

  const children = !schedule ? "" : schedule.map(d => {
    console.log(d.end - d.start)
    return <Col className="p-0" key={d.id}>
      <Spacer height={d.start * cellHeight} />
        <TimeSlot height={cellHeight * (d.end - d.start)} />
    </Col>
  })

  return <div style={style}>
    <Row className="m-0">
    {children}
    </Row>
  </div>
}

const TimeSlot = ({ height }) => {
  const style = {
    height: height + 'rem',
    marginLeft: '2px',
    marginRight: '1px',
    background: '#17a2b8',
    borderRadius: '8px'
  }

  return <div style={style} />
}

const ScheduleHeader = ({days, height, timeColWidth}) => {
  const dayStyle = {
    height: height ? height + 'rem' : '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }

  const dayLabels = days.map(d => {
    return <Col style={dayStyle} key={d}>{d}</Col>
  })

  return (
    <Row className="w-100 mx-0 bg-dark text-light">
      <div style={{width: timeColWidth + 'rem'}} />
      {dayLabels}
      <div style={{width: `12px`}} />
    </Row>
  )
}

const DayCol = ({day, times, cellHeight, top}) => {
  const cellStyle = {
    height: cellHeight ? cellHeight + 'rem' : '4rem',
    padding: '0',
    borderTop: borderStyle,
    borderLeft: borderStyle
  }

  const cells = times.map(d => {
    return <div style={cellStyle} key={d.value} />
  })

  return <Col className="p-0">
    <div className="flex-column">
      <Spacer height={top} border />
      {cells}
    </div>
  </Col>
}

const TimeCol = ( {times, width, cellHeight, top, fontSize }) => {

  const style = {
    width: width ? width + 'rem' : '4rem',
    padding: '0'
  }

  const timeStyle = {
    height: fontSize ? fontSize + 'rem' : '1rem',
    fontSize: fontSize ? fontSize + 'rem' : '1rem',
    textAlign: 'right',
    paddingRight: '.5rem',
    fontWeight: '300'
  }

  const timeLabels = times.map(d => {
    return <>
      <div key={d.value} style={timeStyle}>{d.label}</div>
      <Spacer key={'spacer-' + d.value} height={cellHeight - fontSize} />
    </>
  })

  timeLabels.unshift(<Spacer height={top - fontSize / 2} />)

  return <div style={style}>
    {timeLabels}
  </div>
}

const Spacer = ({height, width, border}) => {
  const style = {
    height: height || height === 0 ? height + 'rem' : '2rem',
    width: width ? width + 'rem' : '100%',
    borderLeft: border ? borderStyle : ''
  }

  return <div style={style} />
}

export default Schedule