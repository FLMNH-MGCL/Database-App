import { Button, Modal, Text } from '@flmnh-mgcl/ui';
import React from 'react';
import DeleteButton from '../buttons/DeleteButton';
import useQuery from '../utils/useQuery';
import useToggle from '../utils/useToggle';

type Props = {
  table: string;
  refresh(): void;
};

export default function CreateDeleteTableModal({ table, refresh }: Props) {
  const [open, { on, off }] = useToggle(false);

  const { deleteTable } = useQuery();

  async function handleDelete() {
    const deleted = await deleteTable(table);

    if (deleted) {
      refresh();
      off();
    }
  }

  return (
    <React.Fragment>
      <Modal open={open} onClose={off}>
        <Modal.Content title="Delete Table - Are you sure?">
          <Text>This action cannot be undone!</Text>
        </Modal.Content>

        <Modal.Footer>
          <Button.Group>
            <Button onClick={off}>Close</Button>
            <Button variant="primary" onClick={handleDelete}>
              Confirm
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal>

      <DeleteButton onClick={on} />
    </React.Fragment>
  );
}
