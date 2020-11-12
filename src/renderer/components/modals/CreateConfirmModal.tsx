import React from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import useToggle from '../utils/useToggle';

type Props = {
  details: string;
  onConfirm(): void;
  trigger: React.ReactNode;
  disabled?: boolean;
};

export default function CreateConfirmModal({
  onConfirm,
  details,
  trigger,
  disabled,
}: Props) {
  const [open, { on, off }] = useToggle(false);

  return (
    <React.Fragment>
      <Modal open={open} onClose={off} size="tiny">
        <Modal.Content title="Are you sure?">{details}</Modal.Content>
        <Modal.Footer>
          <Button.Group>
            <Button onClick={off}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                onConfirm();
                off();
              }}
            >
              Confirm
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal>

      <div onClick={disabled ? () => {} : on}>{trigger}</div>
    </React.Fragment>
  );
}
