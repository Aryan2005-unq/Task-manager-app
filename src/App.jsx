import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { createTodo, deleteTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import {
  withAuthenticator,
  Button,
  Heading,
  Text,
  TextField,
  View,
  Flex,
  Card,
  Badge,
  ThemeProvider,
  defaultTheme,
  Loader
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

const initialState = { name: '', description: '' };
const client = generateClient();

function App({ signOut, user }) {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({ query: listTodos });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      // Optimistic update (requires a temporary ID)
      const tempId = 'temp-' + Date.now();
      setTodos([...todos, { ...todo, id: tempId }]);
      setFormState(initialState);
      
      const { data } = await client.graphql({
        query: createTodo,
        variables: { input: todo }
      });
      // Replace optimistic todo with real one from DB (containing the ID)
      setTodos(prev => [...prev.filter(t => !t.id.toString().startsWith('temp')), data.createTodo]);
    } catch (err) {
      setTodos(prev => prev.filter(t => !t.id?.toString().startsWith('temp')));
      console.log('error creating todo:', err);
      alert('Error creating task: ' + (err.errors?.[0]?.message || err.message || JSON.stringify(err)));
    }
  }

  async function removeTodo(id) {
    if (!id || id.toString().startsWith('temp')) return; // Prevent deleting optimistic items before they have an ID
    try {
      const newTodosArray = todos.filter(todo => todo.id !== id);
      setTodos(newTodosArray);
      await client.graphql({
        query: deleteTodo,
        variables: { input: { id } }
      });
    } catch (err) {
      console.log('Error deleting todo', err);
      alert('Error deleting task: ' + (err.errors?.[0]?.message || err.message || JSON.stringify(err)));
      fetchTodos(); // Re-fetch to undo optimistic delete
    }
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <View backgroundColor="var(--amplify-colors-background-secondary)" minHeight="100vh" padding="2rem">
        <Flex direction="column" alignItems="center">
          
          {/* Header Card */}
          <Card variation="elevated" width="100%" maxWidth="600px" padding="1.5rem" borderRadius="medium">
            <Flex direction="row" justifyContent="space-between" alignItems="center">
              <View>
                <Heading level={3} color="font.primary">Dashboard</Heading>
                <Text color="font.tertiary">Welcome back, {user?.username}</Text>
              </View>
              <Button variation="link" onClick={signOut} size="small">
                Sign Out
              </Button>
            </Flex>
          </Card>

          {/* Create Todo Form */}
          <Card variation="elevated" width="100%" maxWidth="600px" marginTop="1.5rem" borderRadius="medium">
            <Heading level={4} marginBottom="1rem">Add a New Task</Heading>
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
              <Button 
                variation="primary" 
                onClick={addTodo} 
                isDisabled={!formState.name || !formState.description}
              >
                Create Task
              </Button>
            </Flex>
          </Card>

          {/* Todo List */}
          <View width="100%" maxWidth="600px" marginTop="2rem">
            <Heading level={4} marginBottom="1rem">
              Your Tasks {!isLoading && <Badge size="small" variation="info">{todos.length}</Badge>}
            </Heading>
            {isLoading ? (
              <Flex justifyContent="center" padding="3rem">
                <Loader size="large" />
              </Flex>
            ) : todos.length === 0 ? (
              <Text color="font.tertiary" textAlign="center" marginTop="2rem">
                You don't have any tasks yet. Create one above!
              </Text>
            ) : (
              <Flex direction="column" gap="1rem">
                {todos.map((todo, index) => (
                  <Card key={todo.id || index} variation="elevated" borderRadius="medium">
                    <Flex direction="row" alignItems="flex-start" justifyContent="space-between">
                      <Flex direction="column" gap="0.2rem">
                        <Text as="strong" fontWeight={700} fontSize="1.1rem" color="font.primary">
                          {todo.name}
                        </Text>
                        <Text as="span" color="font.secondary">
                          {todo.description}
                        </Text>
                      </Flex>
                      <Button 
                        variation="destructive" 
                        size="small" 
                        onClick={() => removeTodo(todo.id)}
                        isDisabled={!todo.id}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            )}
          </View>
        </Flex>
      </View>
    </ThemeProvider>
  );
}

export default withAuthenticator(App);
