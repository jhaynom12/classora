'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MessageCircle, ThumbsUp, Share2, Flag, MoreVertical, Send, Plus,
  Users, Heart, Reply, Pin, AlertCircle, CheckCircle, X, Search,
  Filter, Calendar, Clock, Image, Link as LinkIcon, Smile, Paperclip,
  ChevronRight, LogOut, Moon, Sun, Bell, Home, FileText, Settings,
  User, Award, Star, TrendingUp, Activity, Sparkles, Brain
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import ActionButtons from '@/app/components/ActionButtons';

interface Post {
  id: string;
  author: string;
  authorRole: 'teacher' | 'parent' | 'admin' | 'student';
  authorAvatar: string;
  authorProfession?: string; // Short profession tag like "Dr", "Eng"
  authorChildrenCount?: number; // Number of children for parents
  title: string;
  content: string;
  category: 'general' | 'academic' | 'events' | 'complaints' | 'suggestions';
  tags: string[];
  likes: number;
  comments: Comment[];
  createdAt: string;
  isPinned: boolean;
  isLocked: boolean;
}

interface Comment {
  id: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  authorProfession?: string;
  authorChildrenCount?: number;
  content: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

interface ForumCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

export default function ForumPage() {
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState('Your School');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const categories: ForumCategory[] = [
    { id: 'all', name: 'All Discussions', icon: MessageCircle, color: 'blue', description: 'View all posts' },
    { id: 'general', name: 'General', icon: Users, color: 'purple', description: 'General school discussions' },
    { id: 'academic', name: 'Academic', icon: FileText, color: 'green', description: 'Academic questions and discussions' },
    { id: 'events', name: 'Events', icon: Calendar, color: 'orange', description: 'School events and activities' },
    { id: 'complaints', name: 'Complaints', icon: AlertCircle, color: 'red', description: 'Report issues or concerns' },
    { id: 'suggestions', name: 'Suggestions', icon: Star, color: 'yellow', description: 'Share your ideas' },
  ];

  // Mock Posts Data
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Mrs. Adebayo',
      authorRole: 'teacher',
      authorAvatar: 'MA',
      title: '📢 Important: Upcoming Examination Schedule',
      content: 'The mid-term examinations will commence on April 20th. All students are expected to be present. The schedule has been posted on the notice board and is also available in the exams section of your dashboard.',
      category: 'events',
      tags: ['exam', 'important', 'schedule'],
      likes: 45,
      comments: [
        {
          id: 'c1',
          author: 'Mr. Okafor',
          authorRole: 'parent',
          authorAvatar: 'MO',
          authorProfession: 'Teacher',
          authorChildrenCount: 3,
          content: 'Thank you for the update. Will there be any revision classes?',
          likes: 5,
          createdAt: '2024-04-14T10:30:00Z',
        },
        {
          id: 'c2',
          author: 'Mrs. Adebayo',
          authorRole: 'teacher',
          authorAvatar: 'MA',
          content: 'Yes, revision classes will be held from April 17th to 19th. Schedule will be shared soon.',
          likes: 8,
          createdAt: '2024-04-14T11:00:00Z',
        }
      ],
      createdAt: '2024-04-14T09:00:00Z',
      isPinned: true,
      isLocked: false,
    },
    {
      id: '2',
      author: 'Mr. Okafor',
      authorRole: 'parent',
      authorAvatar: 'MO',
      authorProfession: 'Teacher',
      authorChildrenCount: 3,
      title: 'Suggestions for Improving School Facilities',
      content: 'I would like to suggest that the school considers upgrading the library facilities. More computers and reference books would greatly benefit the students.',
      category: 'suggestions',
      tags: ['facilities', 'library', 'improvement'],
      likes: 23,
      comments: [
        {
          id: 'c3',
          author: 'Principal',
          authorRole: 'admin',
          authorAvatar: 'PR',
          content: 'Thank you for your suggestion. We are currently planning a library upgrade for next term.',
          likes: 15,
          createdAt: '2024-04-13T15:00:00Z',
        }
      ],
      createdAt: '2024-04-13T12:00:00Z',
      isPinned: false,
      isLocked: false,
    },
    {
      id: '3',
      author: 'Adeola K.',
      authorRole: 'student',
      authorAvatar: 'AK',
      title: 'Need Help with Mathematics Assignment',
      content: 'I am struggling with the algebra assignment. Can any teacher or fellow student help explain question 5?',
      category: 'academic',
      tags: ['mathematics', 'homework', 'help'],
      likes: 12,
      comments: [
        {
          id: 'c4',
          author: 'Mrs. Adebayo',
          authorRole: 'teacher',
          authorAvatar: 'MA',
          content: 'Adeola, I will explain it in tomorrow\'s class. Please come a bit early.',
          likes: 7,
          createdAt: '2024-04-13T09:00:00Z',
        }
      ],
      createdAt: '2024-04-12T20:00:00Z',
      isPinned: false,
      isLocked: false,
    },
  ]);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('classora_user');
    const savedSchool = localStorage.getItem('classora_school_name');
    if (savedUser) setUser(JSON.parse(savedUser));
    else window.location.href = '/';
    if (savedSchool) setSchoolName(savedSchool);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      author: user?.name || 'Anonymous',
      authorRole: user?.role || 'parent',
      authorAvatar: (user?.name?.charAt(0) || 'U').toUpperCase(),
      authorProfession: user?.profession,
      authorChildrenCount: user?.role === 'parent' ? (user?.childrenCount || 0) : undefined,
      content: commentText,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    setPosts(posts.map(post => 
      post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
    ));
    setCommentText('');
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    const newPostObj: Post = {
      id: Date.now().toString(),
      author: user?.name || 'Anonymous',
      authorRole: user?.role || 'parent',
      authorAvatar: (user?.name?.charAt(0) || 'U').toUpperCase(),
      authorProfession: user?.profession,
      authorChildrenCount: user?.role === 'parent' ? (user?.childrenCount || 0) : undefined,
      title: newPost.title,
      content: newPost.content,
      category: newPost.category as any,
      tags: [],
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      isPinned: false,
      isLocked: false,
    };

    setPosts([newPostObj, ...posts]);
    setShowNewPostModal(false);
    setNewPost({ title: '', content: '', category: 'general' });
  };

  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === activeCategory);

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'general': return 'bg-purple-500/20 text-purple-400';
      case 'academic': return 'bg-green-500/20 text-green-400';
      case 'events': return 'bg-orange-500/20 text-orange-400';
      case 'complaints': return 'bg-red-500/20 text-red-400';
      case 'suggestions': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (!mounted || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <ActionButtons />

      {/* Header */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/${user?.role}`}>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-5 h-5 text-white rotate-180" />
                </button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-white font-semibold hidden sm:inline">Classora</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="text-white/80 text-sm">{schoolName}</span>
                <span className="text-white/30">•</span>
                <span className="text-purple-400 text-sm">Community Forum</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-full bg-white/5">
                {theme === 'light' ? <Moon className="w-5 h-5 text-white/70" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Parent-Teacher Community Forum</h1>
          <p className="text-gray-400">Connect, share, and collaborate with the school community</p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`p-4 rounded-2xl text-center transition-all ${
                activeCategory === category.id
                  ? `bg-gradient-to-r from-${category.color}-600/30 to-${category.color}-600/20 border border-${category.color}-500/50`
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <category.icon className={`w-6 h-6 mx-auto mb-2 ${activeCategory === category.id ? `text-${category.color}-400` : 'text-gray-400'}`} />
              <p className={`text-xs font-medium ${activeCategory === category.id ? 'text-white' : 'text-gray-400'}`}>{category.name}</p>
            </button>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowNewPostModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Discussion
          </button>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`rounded-2xl bg-white/5 backdrop-blur-xl border ${
                post.isPinned ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/10'
              } p-6 hover:bg-white/10 transition-all cursor-pointer`}
              onClick={() => setSelectedPost(post)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {post.authorAvatar}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-white font-semibold">{post.author}</span>
                    {post.authorRole === 'parent' && post.authorProfession && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300">
                        {post.authorProfession} • {post.authorChildrenCount || 0} child{(post.authorChildrenCount || 0) !== 1 ? 'ren' : ''}
                      </span>
                    )}
                    {post.authorRole === 'teacher' && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                        Teacher
                      </span>
                    )}
                    {post.authorRole === 'admin' && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                        Admin
                      </span>
                    )}
                    {post.authorRole === 'student' && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-500/20 text-gray-300">
                        Student
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    {post.isPinned && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    <span className="text-gray-500 text-xs">{formatDate(post.createdAt)}</span>
                  </div>
                  
                  <h3 className="text-white font-bold text-lg mb-2">{post.title}</h3>
                  <p className="text-gray-300 text-sm line-clamp-2">{post.content}</p>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                      className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments.length} comments</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-purple-400 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowNewPostModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Start New Discussion</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                />
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
                >
                  <option value="general">General Discussion</option>
                  <option value="academic">Academic</option>
                  <option value="events">Events</option>
                  <option value="complaints">Complaints</option>
                  <option value="suggestions">Suggestions</option>
                </select>
                <textarea
                  rows={6}
                  placeholder="Write your message..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none resize-none"
                />
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowNewPostModal(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white">Cancel</button>
                  <button onClick={handleCreatePost} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">Post</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20"
            >
              <div className="sticky top-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-6 border-b border-white/10">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(selectedPost.category)}`}>
                        {selectedPost.category}
                      </span>
                      {selectedPost.isPinned && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Pinned</span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedPost.title}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                          {selectedPost.authorAvatar}
                        </div>
                        <span className="text-white text-sm">{selectedPost.author}</span>
                      </div>
                      <span className="text-gray-500 text-xs">{formatDate(selectedPost.createdAt)}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPost(null)} className="p-2 rounded-lg hover:bg-white/10">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-300 whitespace-pre-wrap">{selectedPost.content}</p>
                
                {/* Comments Section */}
                <div className="mt-8">
                  <h3 className="text-white font-bold text-lg mb-4">
                    Comments ({selectedPost.comments.length})
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    {selectedPost.comments.map((comment) => (
                      <div key={comment.id} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs">
                            {comment.authorAvatar}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{comment.author}</span>
                            {comment.authorRole === 'parent' && comment.authorProfession && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300">
                                {comment.authorProfession} • {comment.authorChildrenCount || 0} child{(comment.authorChildrenCount || 0) !== 1 ? 'ren' : ''}
                              </span>
                            )}
                            {comment.authorRole === 'teacher' && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                                Teacher
                              </span>
                            )}
                            {comment.authorRole === 'admin' && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                                Admin
                              </span>
                            )}
                            {comment.authorRole === 'student' && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-500/20 text-gray-300">
                                Student
                              </span>
                            )}
                          </div>
                          <span className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-300 text-sm ml-11">{comment.content}</p>
                        <div className="flex items-center gap-4 ml-11 mt-2">
                          <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 text-xs">
                            <ThumbsUp className="w-3 h-3" />
                            {comment.likes}
                          </button>
                          <button className="flex items-center gap-1 text-gray-400 hover:text-green-400 text-xs">
                            <Reply className="w-3 h-3" />
                            Reply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(selectedPost.id)}
                      className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      onClick={() => handleAddComment(selectedPost.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
        @keyframes float-delayed { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-30px, 30px); } }
        .animate-float { animation: float 12s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 14s ease-in-out infinite; }
      `}</style>
    </div>
  );
}