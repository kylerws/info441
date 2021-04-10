import React from 'react'
import { Button, Modal } from 'react-bootstrap'
// import { render } from 'react-dom'

const CustomModal = ({show, hide, title, content}) => {
  return (
    <Modal show={show} onHide={hide} centered size="lg">
       <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body id="profile">
          {content}
        </Modal.Body>
        <Modal.Footer className="justify-content-start">

            <Button onClick={hide} variant="dark">Back to Dashboard</Button>
        </Modal.Footer>
    </Modal>
  )
}

export default CustomModal