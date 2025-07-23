
import React, { useState } from 'react';
import { BlogPost, BlogPostStatus, HistoryLog } from '../types';
import Card from './Card';
import Button from './Button';
import Icon from './Icon';
import { useLanguage } from './LanguageContext';
import BlogEditModal from './BlogEditModal';

interface BlogPageProps {
  posts: BlogPost[];
  onViewPost: (postId: string) => void;
  isAdmin: boolean;
  onEditPost: (posts: BlogPost[]) => void;
  currentUserId: string | null;
  logAction: (action: string, target: HistoryLog['target']) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ posts, onViewPost, isAdmin, onEditPost, currentUserId, logAction }) => {
  const { t, language } = useLanguage();
  const [editingPost, setEditingPost] = useState<BlogPost | 'new' | null>(null);

  const handleSavePost = (postData: Omit<BlogPost, 'id' | 'authorId' | 'createdAt' | 'status'>) => {
    let updatedPosts;
    if (editingPost === 'new') {
        const newPost: BlogPost = {
            ...postData,
            id: `post-${Date.now()}`,
            authorId: currentUserId!,
            createdAt: new Date(),
            status: BlogPostStatus.PUBLISHED,
        };
        updatedPosts = [newPost, ...posts];
        logAction('Blog Post Created', { type: 'blog', id: newPost.id, name: newPost.title.en });
    } else if(editingPost) {
        updatedPosts = posts.map(p => p.id === editingPost.id ? { ...p, ...postData } : p);
        logAction('Blog Post Edited', { type: 'blog', id: editingPost.id, name: postData.title.en });
    } else {
        return;
    }
    onEditPost(updatedPosts);
    setEditingPost(null);
  };
  
  const filteredPosts = isAdmin 
    ? posts 
    : posts.filter(p => p.status === BlogPostStatus.PUBLISHED);
  
  const sortedPosts = [...filteredPosts].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-8">
      {editingPost && <BlogEditModal onClose={() => setEditingPost(null)} onSave={handleSavePost} post={editingPost === 'new' ? null : editingPost} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('Solar Insights Blog')}</h1>
          <p className="text-lg text-gray-400">{t('News, tips, and updates from the world of solar energy.')}</p>
        </div>
        {isAdmin && <Button onClick={() => setEditingPost('new')}>{t('Add New Post')}</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedPosts.map(post => {
            const title = post.title[language] || post.title.en;
            const content = post.content[language] || post.content.en;
            return (
              <Card key={post.id} className="flex flex-col group overflow-hidden p-0">
                <div className="relative">
                  <img src={post.imageDataUrl} alt={title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"/>
                   {isAdmin && post.status === BlogPostStatus.HIDDEN && (
                        <span className="absolute top-2 right-2 bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">{t('HIDDEN')}</span>
                    )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold text-white mb-2 flex-grow">{title}</h2>
                  <p className="text-gray-400 text-sm mb-4">{new Date(post.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-300 text-sm mb-6 flex-grow">{content.substring(0, 100)}...</p>
                  <Button onClick={() => onViewPost(post.id)} variant="secondary" className="w-full mt-auto">
                    {t('Read More')}
                  </Button>
                </div>
              </Card>
            )
        })}
      </div>
    </div>
  );
};

export default BlogPage;
