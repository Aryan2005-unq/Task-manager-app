import { CheckboxField, Card, Flex, Text, Button, View, Badge } from '@aws-amplify/ui-react';
import { useState } from 'react';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import { getUrl } from 'aws-amplify/storage';
import { post } from 'aws-amplify/api';

export function TodoItem({ todo, onUpdate, onDelete }) {
  const [advice, setAdvice] = useState([]);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);

  const getAdvice = async () => {
    setIsAdviceLoading(true);
    setAdvice([]);
    try {
      let imageUrl = null;
      if (todo.filePath) {
        const requestPath = todo.filePath.startsWith('public/') 
          ? todo.filePath 
          : `public/${todo.filePath}`;
        const res = await getUrl({ 
          path: requestPath,
          options: { validateObjectExistence: false } 
        });
        imageUrl = res.url.toString();
      }

      const restOperation = post({ 
        apiName: 'aiprediction', 
        path: '/suggest', 
        options: {
          headers: { 'Content-Type': 'application/json' },
          body: { task: todo, imageUrl }
        }
      });
      const res = await restOperation.response;
      const data = await res.body.json();
      
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setAdvice(data.suggestions);
      } else {
        alert("AI API Error: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error("RAW ERROR:", err);
      // Amplify gen 1/2 REST exceptions wrap the response
      if (err.response) {
        try {
          const body = await err.response.body.json();
          alert("Lambda Error: " + JSON.stringify(body));
        } catch (e) {
          alert("Lambda threw a raw 500 error: " + err.message);
        }
      } else {
        alert("Error generating advice: " + err.message);
      }
    } finally {
      setIsAdviceLoading(false);
    }
  };

  const handleViewFile = async () => {
    if (!todo.filePath) return;
    try {
      // Determine the exact path depending on how Gen 1 stored it
      // Gen 1 `accessLevel="guest"` stores keys directly, while Gen 2 `path` uses the exact string.
      // If filePath already starts with 'public/', don't prepend it again to avoid 'public/public/'.
      const requestPath = todo.filePath.startsWith('public/') 
        ? todo.filePath 
        : `public/${todo.filePath}`;

      const res = await getUrl({ 
        path: requestPath,
        options: { validateObjectExistence: false } 
      });
      window.open(res.url.toString(), '_blank');
    } catch (err) {
      console.error("Error opening file URL:", err);
      alert("Could not load the image. Please try again.");
    }
  };

  const handleToggle = (e) => {
    // Fire the update with inverted isCompleted status
    onUpdate({
      ...todo,
      isCompleted: e.target.checked
    });
  };

  // Determine priority-based CSS class
  const priorityClass = todo.priority 
    ? `todo-card--${todo.priority.toLowerCase()}` 
    : '';
  const completedClass = todo.isCompleted ? 'todo-card--completed' : '';

  return (
    <Card 
      className={`todo-card ${priorityClass} ${completedClass}`}
      variation="elevated" 
      borderRadius="medium" 
      backgroundColor={todo.isCompleted ? 'var(--amplify-colors-background-tertiary)' : 'var(--amplify-colors-background-primary)'}
    >
      <Flex direction="row" alignItems="flex-start" justifyContent="space-between">
        
        {/* Left Side: Checkbox + Text */}
        <Flex direction="row" alignItems="flex-start" gap="1rem" flex="1">
          <CheckboxField
            label=""
            name="isCompleted"
            checked={todo.isCompleted || false}
            onChange={handleToggle}
            size="large"
            style={{ marginTop: '0.3rem' }}
          />

          <Flex direction="column" gap="0.2rem" flex="1">
            <Flex direction="row" alignItems="center" gap="0.5rem" wrap="wrap">
              <Text 
                className="todo-title"
                as="strong" 
                fontWeight={700} 
                fontSize="1.1rem" 
                color="font.primary"
                textDecoration={todo.isCompleted ? 'line-through' : 'none'}
                opacity={todo.isCompleted ? 0.6 : 1}
              >
                {todo.name}
              </Text>
              
              {todo.priority && (
                <Badge
                  size="small"
                  variation={
                    todo.priority === 'High' ? 'error' : 
                    todo.priority === 'Medium' ? 'warning' : 'success'
                  }
                  opacity={todo.isCompleted ? 0.6 : 1}
                >
                  {todo.priority === 'High' ? '🔴' : todo.priority === 'Medium' ? '🟡' : '🟢'} {todo.priority}
                </Badge>
              )}

              {todo.dueDate && (
                <Badge size="small" variation="info" opacity={todo.isCompleted ? 0.6 : 1}>
                  📅 {new Date(todo.dueDate).toLocaleDateString()}
                </Badge>
              )}
            </Flex>

            <Text 
              className="todo-description"
              as="span" 
              color="font.secondary"
              textDecoration={todo.isCompleted ? 'line-through' : 'none'}
              opacity={todo.isCompleted ? 0.6 : 1}
            >
              {todo.description}
            </Text>

            {/* Display the uploaded file if there is one attached */}
            {todo.filePath && (
              <View 
                className="todo-attachment"
                marginTop="0.5rem" 
                maxWidth="200px" 
                borderRadius="small" 
                overflow="hidden" 
                boxShadow="medium"
                style={{ cursor: 'pointer' }}
                onClick={handleViewFile}
              >
                <StorageImage 
                  alt="Task attachment" 
                  path={todo.filePath.startsWith('public/') ? todo.filePath : `public/${todo.filePath}`} 
                  fallbackSrc="/placeholder.png" 
                />
                <Text fontSize="small" color="font.primary" textAlign="center" padding="0.3rem" backgroundColor="var(--amplify-colors-background-tertiary)">🔍 View full size</Text>
              </View>
            )}
            
            {/* AI Advice Section */}
            {!todo.isCompleted && (
              <Flex direction="column" marginTop="1rem" gap="0.5rem">
                <Button 
                  className="ai-advice-btn"
                  size="small" 
                  onClick={getAdvice} 
                  isLoading={isAdviceLoading}
                  variation="primary"
                  loadingText="Generating advice..."
                >
                  ✨ Get AI Advice
                </Button>
                {advice.length > 0 && (
                  <View className="ai-advice-box" padding="0.75rem">
                    <Text fontWeight="bold" fontSize="0.9rem" marginBottom="0.3rem" color="font.primary">
                      🤖 AI Suggested Steps:
                    </Text>
                    <ul>
                      {advice.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </View>
                )}
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Right Side: Delete Button */}
        <Button 
          className="todo-delete-btn"
          variation="destructive" 
          size="small" 
          onClick={() => onDelete(todo.id)}
          isDisabled={!todo.id || todo.id.toString().startsWith('temp')}
        >
          🗑️ Delete
        </Button>
      </Flex>
    </Card>
  );
}