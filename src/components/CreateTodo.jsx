import { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { StorageManager } from '@aws-amplify/ui-react-storage';
import { createTodo } from '../graphql/mutations';
import { Card, Heading, Flex, TextField, Button, Text, SelectField, View } from '@aws-amplify/ui-react';

const client = generateClient();

export function CreateTodo({ onTodoCreated }) {
  const [formState, setFormState] = useState({ 
    name: '', 
    description: '', 
    filePath: null,
    priority: 'Medium',
    dueDate: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function addTodo() {
    if (!formState.name || !formState.description) return;
    
    // We pass the new todo payload back to the parent to handle optimistic updates
    const todoPayload = { 
      name: formState.name, 
      description: formState.description,
      isCompleted: false,
      filePath: formState.filePath,
      priority: formState.priority,
      dueDate: formState.dueDate || null 
    };

    onTodoCreated(todoPayload);
    setFormState({ name: '', description: '', filePath: null, priority: 'Medium', dueDate: '' });
  }

  return (
    <Card className="create-todo-card" variation="elevated" width="100%" maxWidth="600px" marginTop="1.5rem" margin="1.5rem auto 0" borderRadius="medium">
      <Heading level={4} marginBottom="1rem">✨ Create a New Task</Heading>
      <Flex direction="column" gap="1rem">
        <TextField
          label="Task Name"
          placeholder="E.g., Buy groceries"
          onChange={(e) => setInput('name', e.target.value)}
          value={formState.name}
          hasError={formState.name === '' && formState.description !== ''}
        />
        <TextField
          label="Description"
          placeholder="E.g., Milk, Eggs, Bread"
          onChange={(e) => setInput('description', e.target.value)}
          value={formState.description}
        />
        <Flex direction="row" gap="1rem" wrap="wrap">
          <SelectField
            label="Priority"
            value={formState.priority}
            onChange={(e) => setInput('priority', e.target.value)}
            flex="1"
          >
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </SelectField>
          
          <TextField
            type="date"
            label="Due Date"
            value={formState.dueDate}
            onChange={(e) => setInput('dueDate', e.target.value)}
            flex="1"
          />
        </Flex>
        
        <Text fontWeight="bold" fontSize="0.9rem" color="font.secondary" marginTop="0.5rem">
          📎 Attach a File (Optional)
        </Text>
        <StorageManager
          acceptedFileTypes={['image/*', '.pdf', '.txt']}
          accessLevel="guest"
          maxFileCount={1}
          onUploadStart={() => setIsUploading(true)}
          onUploadSuccess={({ key }) => {
            setInput('filePath', key);
            setIsUploading(false);
          }}
          onUploadError={(error) => {
            setIsUploading(false);
            alert('Error uploading file: ' + error);
          }}
          onFileRemove={() => setInput('filePath', null)}
        />

        <Button 
          className="create-submit-btn"
          variation="primary" 
          onClick={addTodo} 
          isDisabled={!formState.name || !formState.description || isUploading}
        >
          {isUploading ? '⏳ Uploading File...' : '🚀 Create Task'}
        </Button>
      </Flex>
    </Card>
  );
}