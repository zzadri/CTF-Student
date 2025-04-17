import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Button, Text, Title, Container, Group, Image, rem } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHome } from '@fortawesome/free-solid-svg-icons';

export default function ErrorPage() {
  const navigate = useNavigate();
  let error: any;
  
  try {
    error = useRouteError();
  } catch (e) {
    console.error("Impossible d'utiliser useRouteError:", e);
    // Continuer sans l'erreur de route
  }
  
  let statusCode = 500;
  let title = 'Erreur serveur';
  let message = 'Une erreur s\'est produite sur le serveur. Veuillez réessayer plus tard.';
  
  if (error) {
    if (isRouteErrorResponse(error)) {
      statusCode = error.status;
      if (statusCode === 404) {
        title = 'Page non trouvée';
        message = 'La page que vous recherchez n\'existe pas ou a été déplacée.';
      }
    } else if (error?.status === 404 || error?.message?.includes('not found')) {
      statusCode = 404;
      title = 'Page non trouvée';
      message = 'La page que vous recherchez n\'existe pas ou a été déplacée.';
    }
  }

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gray-900 p-4">
      <Container>
        <div className="text-center">
          <Image
            src={`/error-${statusCode === 404 ? '404' : '500'}.svg`}
            alt={`Erreur ${statusCode}`}
            maw={400}
            mx="auto"
            mb={rem(32)}
          />
          
          <Title 
            c="white" 
            fz={48} 
            fw={900}
            mb={rem(16)}
          >
            {title}
          </Title>
          
          <Text 
            size="lg" 
            c="gray.4"
            maw={600}
            mx="auto"
            mb={rem(24)}
          >
            {message}
          </Text>

          <Group justify="center" mt={rem(24)}>
            <Button
              size="md"
              variant="outline"
              color="gray"
              leftSection={<FontAwesomeIcon icon={faArrowLeft} />}
              onClick={() => navigate(-1)}
            >
              Retour
            </Button>
            <Button
              size="md"
              color="blue"
              leftSection={<FontAwesomeIcon icon={faHome} />}
              onClick={() => navigate('/')}
            >
              Accueil
            </Button>
          </Group>
        </div>
      </Container>
    </div>
  );
} 