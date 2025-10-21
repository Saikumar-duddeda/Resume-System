import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileText, Plus, LogOut, Trash2, Edit, Download } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get(`${API}/resumes`);
      setResumes(response.data);
    } catch (error) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const createResume = async () => {
    if (!newResumeTitle.trim()) {
      toast.error('Please enter a resume title');
      return;
    }

    try {
      const response = await axios.post(`${API}/resumes`, {
        title: newResumeTitle,
        template: 'modern'
      });
      toast.success('Resume created!');
      setCreateDialogOpen(false);
      setNewResumeTitle('');
      navigate(`/resume/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to create resume');
    }
  };

  const deleteResume = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      await axios.delete(`${API}/resumes/${id}`);
      toast.success('Resume deleted');
      fetchResumes();
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const downloadResume = async (id, title) => {
    try {
      const response = await axios.get(`${API}/resumes/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Resume downloaded!');
    } catch (error) {
      toast.error('Failed to download resume');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <nav className="bg-white border-b border-slate-200 px-8 py-4" data-testid="dashboard-nav">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ResumeAI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Welcome, {user?.name}</span>
            <Button variant="outline" onClick={handleLogout} data-testid="logout-btn">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">My Resumes</h2>
            <p className="text-slate-600">Create and manage your professional resumes</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-testid="create-resume-btn">
                <Plus className="w-4 h-4 mr-2" />
                Create Resume
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="create-resume-dialog">
              <DialogHeader>
                <DialogTitle>Create New Resume</DialogTitle>
                <DialogDescription>Give your resume a title to get started</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="resume-title">Resume Title</Label>
                  <Input
                    id="resume-title"
                    placeholder="e.g., Software Engineer Resume"
                    value={newResumeTitle}
                    onChange={(e) => setNewResumeTitle(e.target.value)}
                    data-testid="resume-title-input"
                  />
                </div>
                <Button 
                  onClick={createResume} 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  data-testid="create-resume-submit-btn"
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {resumes.length === 0 ? (
          <Card className="text-center py-16" data-testid="empty-state">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold mb-2 text-slate-900">No resumes yet</h3>
              <p className="text-slate-600 mb-6">Create your first resume to get started</p>
              <Button 
                onClick={() => setCreateDialogOpen(true)} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                data-testid="empty-create-resume-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Resume
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="resumes-grid">
            {resumes.map((resume) => (
              <Card key={resume.id} className="hover:shadow-lg transition-shadow" data-testid={`resume-card-${resume.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{resume.title}</CardTitle>
                  <CardDescription>
                    Updated {new Date(resume.updated_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => navigate(`/resume/${resume.id}`)}
                      data-testid={`edit-resume-btn-${resume.id}`}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => downloadResume(resume.id, resume.title)}
                      data-testid={`download-resume-btn-${resume.id}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                      onClick={() => deleteResume(resume.id)}
                      data-testid={`delete-resume-btn-${resume.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;