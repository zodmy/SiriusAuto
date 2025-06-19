'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import CategoryCard from '@/components/CategoryCard';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Grid from '@/components/Grid';
import Heading from '@/components/Heading';
import Text from '@/components/Text';
import Skeleton from '@/components/Skeleton';

interface Category {
  id: number;
  name: string;
  description?: string;
  children: Category[];
  parent?: {
    id: number;
    name: string;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Категорії автозапчастин - Sirius Auto';
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Помилка завантаження категорій:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const breadcrumbs = [
    { name: 'Головна', href: '/' },
    { name: 'Всі категорії', href: '/categories' },
  ];

  const getTopLevelCategories = () => {
    return categories.filter((cat) => !cat.parent).sort((a, b) => a.name.localeCompare(b.name, 'uk', { sensitivity: 'base' }));
  };
  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <Container maxWidth='7xl' padding='md'>
        <Card padding='md' className='mb-6 sm:mb-8'>
          <div className='text-center'>
            <Heading level={1} size='2xl' className='mb-3 sm:mb-4'>
              Категорії
            </Heading>
            <Text size='sm' color='muted' className='max-w-2xl mx-auto'>
              Оберіть потрібну категорію для перегляду товарів
            </Text>
          </div>
        </Card>

        {isLoading ? (
          <Grid cols={{ default: 1, sm: 2, lg: 3 }} gap='md'>
            {[...Array(6)].map((_, index) => (
              <Card key={index} padding='md'>
                <div className='text-center'>
                  <Skeleton variant='circular' width={48} height={48} className='mx-auto mb-3 sm:mb-4' />
                  <Skeleton variant='text' width='75%' className='mx-auto mb-2' />
                  <Skeleton variant='text' width='50%' className='mx-auto' />
                </div>
              </Card>
            ))}
          </Grid>
        ) : (
          <Grid cols={{ default: 1, sm: 2, lg: 3 }} gap='md'>
            {getTopLevelCategories().map((category) => (
              <CategoryCard key={category.id} category={category} showChildren={true} />
            ))}
          </Grid>
        )}
      </Container>
    </PageLayout>
  );
}
