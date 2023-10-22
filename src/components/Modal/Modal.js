import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function GeoJiggleModal({ children, ...rest }) {
  return (
    <Modal {...rest} size='lg' aria-labelledby='contained-modal-title-vcenter' centered>
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>{rest.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={rest.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GeoJiggleModal;
