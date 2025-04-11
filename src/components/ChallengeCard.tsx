import { Card, Text, Badge, Group, Button } from '@mantine/core';

interface ChallengeCardProps {
  title: string;
  description: string;
  points: number;
  category: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  onStart: () => void;
}

export function ChallengeCard({ title, description, points, category, difficulty, onStart }: ChallengeCardProps) {
  const difficultyColor = {
    Facile: 'green',
    Moyen: 'yellow',
    Difficile: 'red',
  }[difficulty];

  return (
    <Card withBorder shadow="sm" radius="md" padding="lg">
      <Card.Section inheritPadding py="xs">
        <Group justify="space-between">
          <Text fw={500}>{title}</Text>
          <Badge color={difficultyColor} variant="light">
            {difficulty}
          </Badge>
        </Group>
      </Card.Section>

      <Text size="sm" c="dimmed" mt="md">
        {description}
      </Text>

      <Group justify="space-between" mt="md">
        <Badge variant="dot">{category}</Badge>
        <Text fw={500} c="dimmed">
          {points} points
        </Text>
      </Group>

      <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={onStart}>
        Commencer le challenge
      </Button>
    </Card>
  );
} 