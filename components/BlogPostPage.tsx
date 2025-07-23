import React from 'react';
import { BlogPost, User } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';

interface BlogPostPageProps {
  post: BlogPost;
  author: User | undefined;
  onBack: () => void;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post, author, onBack }) => {
  const { t, language } = useLanguage();

  const title = post.title[language] || post.title.en;
  const content = post.content[language] || post.content.en;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Button variant="secondary" size="sm" onClick={onBack} icon={<Icon name="arrow-left" className="w-4 h-4" />}>
          {t('Back to Blog')}
        </Button>
      </div>

      <article>
        <img src={post.imageDataUrl} alt={title} className="w-full h-64 md:h-96 object-cover rounded-lg mb-8" />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">{title}</h1>
        
        <div className="flex items-center gap-4 text-gray-400 mb-8">
          <span>{t('By {name}', { name: author?.name || 'SolarPortal Team' })}</span>
          <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
          <span>{new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        
        <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;