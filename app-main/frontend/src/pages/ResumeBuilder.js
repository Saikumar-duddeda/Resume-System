import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ArrowLeft, Save, Download, Sparkles, Plus, Trash2, Award } from 'lucide-react';

const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resume, setResume] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [aiLoading, setAiLoading] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const response = await axios.get(`${API}/resumes/${id}`);
      setResume(response.data);
    } catch (error) {
      toast.error('Failed to load resume');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/resumes/${id}`, { data: resume.data });
      toast.success('Resume saved!');
    } catch (error) {
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const updatePersonalInfo = (field, value) => {
    setResume({
      ...resume,
      data: {
        ...resume.data,
        personal_info: {
          ...resume.data.personal_info,
          [field]: value
        }
      }
    });
  };

  const updateSummary = (value) => {
    setResume({
      ...resume,
      data: {
        ...resume.data,
        summary: value
      }
    });
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      type: 'internship',
      title: '',
      organization: '',
      description: '',
      skills: [],
      start_date: '',
      end_date: '',
      verified: false
    };
    setResume({
      ...resume,
      data: {
        ...resume.data,
        experiences: [...resume.data.experiences, newExp]
      }
    });
  };

  const updateExperience = (index, field, value) => {
    const experiences = [...resume.data.experiences];
    experiences[index] = { ...experiences[index], [field]: value };
    setResume({
      ...resume,
      data: { ...resume.data, experiences }
    });
  };

  const deleteExperience = (index) => {
    const experiences = resume.data.experiences.filter((_, i) => i !== index);
    setResume({
      ...resume,
      data: { ...resume.data, experiences }
    });
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      field: '',
      start_date: '',
      end_date: '',
      gpa: ''
    };
    setResume({
      ...resume,
      data: {
        ...resume.data,
        education: [...resume.data.education, newEdu]
      }
    });
  };

  const updateEducation = (index, field, value) => {
    const education = [...resume.data.education];
    education[index] = { ...education[index], [field]: value };
    setResume({
      ...resume,
      data: { ...resume.data, education }
    });
  };

  const deleteEducation = (index) => {
    const education = resume.data.education.filter((_, i) => i !== index);
    setResume({
      ...resume,
      data: { ...resume.data, education }
    });
  };

  const addSkill = () => {
    const newSkill = {
      id: Date.now().toString(),
      name: '',
      proficiency: 3,
      verified: false
    };
    setResume({
      ...resume,
      data: {
        ...resume.data,
        skills: [...resume.data.skills, newSkill]
      }
    });
  };

  const updateSkill = (index, field, value) => {
    const skills = [...resume.data.skills];
    skills[index] = { ...skills[index], [field]: value };
    setResume({
      ...resume,
      data: { ...resume.data, skills }
    });
  };

  const deleteSkill = (index) => {
    const skills = resume.data.skills.filter((_, i) => i !== index);
    setResume({
      ...resume,
      data: { ...resume.data, skills }
    });
  };

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      title: '',
      description: '',
      technologies: [],
      link: ''
    };
    setResume({
      ...resume,
      data: {
        ...resume.data,
        projects: [...resume.data.projects, newProject]
      }
    });
  };

  const updateProject = (index, field, value) => {
    const projects = [...resume.data.projects];
    projects[index] = { ...projects[index], [field]: value };
    setResume({
      ...resume,
      data: { ...resume.data, projects }
    });
  };

  const deleteProject = (index) => {
    const projects = resume.data.projects.filter((_, i) => i !== index);
    setResume({
      ...resume,
      data: { ...resume.data, projects }
    });
  };

  const generateSummary = async () => {
    setAiLoading(true);
    try {
      const response = await axios.post(`${API}/ai/generate-summary`, {
        prompt: 'Generate summary',
        context: {
          experiences: resume.data.experiences,
          skills: resume.data.skills
        }
      });
      updateSummary(response.data.summary);
      toast.success('Summary generated!');
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setAiLoading(false);
    }
  };

  const calculateScore = async () => {
    try {
      const response = await axios.post(`${API}/ai/calculate-score`, {
        prompt: 'Calculate score',
        context: resume.data
      });
      setScore(response.data);
    } catch (error) {
      toast.error('Failed to calculate score');
    }
  };

  const downloadResume = async () => {
    try {
      const response = await axios.get(`${API}/resumes/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resume.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Resume downloaded!');
    } catch (error) {
      toast.error('Failed to download resume');
    }
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
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10" data-testid="builder-nav">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} data-testid="back-to-dashboard-btn">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-slate-900">{resume.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={calculateScore} data-testid="calculate-score-btn">
              <Award className="w-4 h-4 mr-2" />
              Score
            </Button>
            <Button variant="outline" onClick={saveResume} disabled={saving} data-testid="save-resume-btn">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={downloadResume} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-testid="download-pdf-btn">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-5 w-full" data-testid="builder-tabs">
                    <TabsTrigger value="personal" data-testid="personal-tab">Personal</TabsTrigger>
                    <TabsTrigger value="summary" data-testid="summary-tab">Summary</TabsTrigger>
                    <TabsTrigger value="experience" data-testid="experience-tab">Experience</TabsTrigger>
                    <TabsTrigger value="education" data-testid="education-tab">Education</TabsTrigger>
                    <TabsTrigger value="skills" data-testid="skills-tab">Skills</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="full-name">Full Name</Label>
                      <Input
                        id="full-name"
                        value={resume.data.personal_info.full_name}
                        onChange={(e) => updatePersonalInfo('full_name', e.target.value)}
                        data-testid="full-name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resume.data.personal_info.email}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        data-testid="email-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={resume.data.personal_info.phone}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        data-testid="phone-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={resume.data.personal_info.location}
                        onChange={(e) => updatePersonalInfo('location', e.target.value)}
                        data-testid="location-input"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="space-y-4 mt-4">
                    <div className="mb-2">
                      <Label>Professional Summary</Label>
                      <p className="text-xs text-slate-500 mt-1">Write a compelling summary highlighting your key strengths and career focus</p>
                    </div>
                    <Textarea
                      rows={6}
                      value={resume.data.summary}
                      onChange={(e) => updateSummary(e.target.value)}
                      placeholder="Write a compelling summary about yourself..."
                      data-testid="summary-textarea"
                    />
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <Label>Work Experience</Label>
                      <Button size="sm" onClick={addExperience} data-testid="add-experience-btn">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    {resume.data.experiences.map((exp, index) => (
                      <Card key={exp.id} data-testid={`experience-item-${index}`}>
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex justify-end">
                            <Button size="sm" variant="ghost" onClick={() => deleteExperience(index)} data-testid={`delete-experience-${index}`}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Job Title"
                            value={exp.title}
                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                            data-testid={`exp-title-${index}`}
                          />
                          <Input
                            placeholder="Company"
                            value={exp.organization}
                            onChange={(e) => updateExperience(index, 'organization', e.target.value)}
                            data-testid={`exp-company-${index}`}
                          />
                          <Textarea
                            placeholder="Description"
                            value={exp.description}
                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                            data-testid={`exp-description-${index}`}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="text"
                              placeholder="Start Date"
                              value={exp.start_date}
                              onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                              data-testid={`exp-start-${index}`}
                            />
                            <Input
                              type="text"
                              placeholder="End Date"
                              value={exp.end_date}
                              onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                              data-testid={`exp-end-${index}`}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="education" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <Label>Education</Label>
                      <Button size="sm" onClick={addEducation} data-testid="add-education-btn">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    {resume.data.education.map((edu, index) => (
                      <Card key={edu.id} data-testid={`education-item-${index}`}>
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex justify-end">
                            <Button size="sm" variant="ghost" onClick={() => deleteEducation(index)} data-testid={`delete-education-${index}`}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            data-testid={`edu-degree-${index}`}
                          />
                          <Input
                            placeholder="Institution"
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            data-testid={`edu-institution-${index}`}
                          />
                          <Input
                            placeholder="Field of Study"
                            value={edu.field}
                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                            data-testid={`edu-field-${index}`}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="text"
                              placeholder="Start Date"
                              value={edu.start_date}
                              onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                              data-testid={`edu-start-${index}`}
                            />
                            <Input
                              type="text"
                              placeholder="End Date"
                              value={edu.end_date}
                              onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                              data-testid={`edu-end-${index}`}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <Label>Skills</Label>
                      <Button size="sm" onClick={addSkill} data-testid="add-skill-btn">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    {resume.data.skills.map((skill, index) => (
                      <div key={skill.id} className="flex gap-2 items-center" data-testid={`skill-item-${index}`}>
                        <Input
                          placeholder="Skill name"
                          value={skill.name}
                          onChange={(e) => updateSkill(index, 'name', e.target.value)}
                          className="flex-1"
                          data-testid={`skill-name-${index}`}
                        />
                        <Button size="sm" variant="ghost" onClick={() => deleteSkill(index)} data-testid={`delete-skill-${index}`}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {score && (
              <Card data-testid="score-card">
                <CardHeader>
                  <CardTitle>Resume Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Overall Score</span>
                      <span className="text-2xl font-bold text-blue-600">{score.score}/100</span>
                    </div>
                    <Progress value={score.score} className="h-3" />
                  </div>
                  {score.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Suggestions:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                        {score.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border-2 border-slate-200 p-8 rounded-lg overflow-y-auto max-h-[calc(100vh-16rem)] resume-preview" data-testid="resume-preview">
                  {resume.data.personal_info.full_name && (
                    <div className="text-center mb-6">
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">{resume.data.personal_info.full_name}</h1>
                      <div className="text-slate-600 space-x-2">
                        {resume.data.personal_info.email && <span>{resume.data.personal_info.email}</span>}
                        {resume.data.personal_info.phone && <span>| {resume.data.personal_info.phone}</span>}
                        {resume.data.personal_info.location && <span>| {resume.data.personal_info.location}</span>}
                      </div>
                    </div>
                  )}

                  {resume.data.summary && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-2 pb-1 border-b-2 border-blue-600">PROFESSIONAL SUMMARY</h2>
                      <p className="text-slate-700">{resume.data.summary}</p>
                    </div>
                  )}

                  {resume.data.experiences.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b-2 border-blue-600">EXPERIENCE</h2>
                      {resume.data.experiences.map((exp, index) => (
                        <div key={exp.id} className="mb-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                          </div>
                          <p className="text-slate-700">{exp.organization}</p>
                          <p className="text-sm text-slate-500 mb-1">{exp.start_date} - {exp.end_date}</p>
                          <p className="text-slate-700">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.data.education.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b-2 border-blue-600">EDUCATION</h2>
                      {resume.data.education.map((edu, index) => (
                        <div key={edu.id} className="mb-3">
                          <h3 className="font-semibold text-slate-900">{edu.degree} - {edu.field}</h3>
                          <p className="text-slate-700">{edu.institution}</p>
                          <p className="text-sm text-slate-500">{edu.start_date} - {edu.end_date}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.data.skills.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b-2 border-blue-600">SKILLS</h2>
                      <div className="flex flex-wrap gap-2">
                        {resume.data.skills.map((skill) => (
                          skill.name && (
                            <span key={skill.id} className="skill-badge">
                              {skill.name}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {resume.data.projects.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b-2 border-blue-600">PROJECTS</h2>
                      {resume.data.projects.map((project, index) => (
                        <div key={project.id} className="mb-3">
                          <h3 className="font-semibold text-slate-900">{project.title}</h3>
                          <p className="text-slate-700">{project.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
