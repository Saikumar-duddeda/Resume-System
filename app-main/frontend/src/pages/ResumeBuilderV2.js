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
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, Download, Sparkles, Plus, Trash2, Award, Briefcase, Code, Trophy, Calendar } from 'lucide-react';

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
        personal_info: { ...resume.data.personal_info, [field]: value }
      }
    });
  };

  const updateSummary = (value) => {
    setResume({ ...resume, data: { ...resume.data, summary: value } });
  };

  // Experience functions
  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      type: 'work',
      title: '',
      organization: '',
      description: '',
      skills: [],
      start_date: '',
      end_date: '',
      location: '',
      achievements: []
    };
    setResume({
      ...resume,
      data: { ...resume.data, experiences: [...resume.data.experiences, newExp] }
    });
  };

  const updateExperience = (index, field, value) => {
    const experiences = [...resume.data.experiences];
    experiences[index] = { ...experiences[index], [field]: value };
    setResume({ ...resume, data: { ...resume.data, experiences } });
  };

  const deleteExperience = (index) => {
    const experiences = resume.data.experiences.filter((_, i) => i !== index);
    setResume({ ...resume, data: { ...resume.data, experiences } });
  };

  // Internship functions
  const addInternship = () => {
    const newIntern = {
      id: Date.now().toString(),
      title: '',
      company: '',
      description: '',
      skills: [],
      start_date: '',
      end_date: '',
      location: '',
      certificate_url: ''
    };
    setResume({
      ...resume,
      data: { ...resume.data, internships: [...resume.data.internships, newIntern] }
    });
  };

  const updateInternship = (index, field, value) => {
    const internships = [...resume.data.internships];
    internships[index] = { ...internships[index], [field]: value };
    setResume({ ...resume, data: { ...resume.data, internships } });
  };

  const deleteInternship = (index) => {
    const internships = resume.data.internships.filter((_, i) => i !== index);
    setResume({ ...resume, data: { ...resume.data, internships } });
  };

  // Hackathon functions
  const addHackathon = () => {
    const newHack = {
      id: Date.now().toString(),
      name: '',
      organizer: '',
      project_title: '',
      description: '',
      achievement: '',
      technologies: [],
      date: '',
      project_link: ''
    };
    setResume({
      ...resume,
      data: { ...resume.data, hackathons: [...resume.data.hackathons, newHack] }
    });
  };

  const updateHackathon = (index, field, value) => {
    const hackathons = [...resume.data.hackathons];
    hackathons[index] = { ...hackathons[index], [field]: value };
    setResume({ ...resume, data: { ...resume.data, hackathons } });
  };

  const deleteHackathon = (index) => {
    const hackathons = resume.data.hackathons.filter((_, i) => i !== index);
    setResume({ ...resume, data: { ...resume.data, hackathons } });
  };

  // Event functions
  const addEvent = () => {
    const newEvent = {
      id: Date.now().toString(),
      title: '',
      organization: '',
      description: '',
      date: '',
      role: ''
    };
    setResume({
      ...resume,
      data: { ...resume.data, events: [...resume.data.events, newEvent] }
    });
  };

  const updateEvent = (index, field, value) => {
    const events = [...resume.data.events];
    events[index] = { ...events[index], [field]: value };
    setResume({ ...resume, data: { ...resume.data, events } });
  };

  const deleteEvent = (index) => {
    const events = resume.data.events.filter((_, i) => i !== index);
    setResume({ ...resume, data: { ...resume.data, events } });
  };

  // Education functions
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
      data: { ...resume.data, education: [...resume.data.education, newEdu] }
    });
  };

  const updateEducation = (index, field, value) => {
    const education = [...resume.data.education];
    education[index] = { ...education[index], [field]: value };
    setResume({ ...resume, data: { ...resume.data, education } });
  };

  const deleteEducation = (index) => {
    const education = resume.data.education.filter((_, i) => i !== index);
    setResume({ ...resume, data: { ...resume.data, education } });
  };

  // Skill functions
  const addSkill = () => {
    const newSkill = {
      id: Date.now().toString(),
      name: '',
      proficiency: 3,
      verified: false
    };
    setResume({
      ...resume,
      data: { ...resume.data, skills: [...resume.data.skills, newSkill] }
    });
  };

  const updateSkill = (index, field, value) => {
    const skills = [...resume.data.skills];
    skills[index] = { ...skills[index], [field]: value };
    setResume({ ...resume, data: { ...resume.data, skills } });
  };

  const deleteSkill = (index) => {
    const skills = resume.data.skills.filter((_, i) => i !== index);
    setResume({ ...resume, data: { ...resume.data, skills } });
  };

  // Project functions
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
      data: { ...resume.data, projects: [...resume.data.projects, newProject] }
    });
  };

  const updateProject = (index, field, value) => {
    const projects = [...resume.data.projects];
    projects[index] = { ...projects[index], [field]: value };
    setResume({ ...resume, data: { ...resume.data, projects } });
  };

  const deleteProject = (index) => {
    const projects = resume.data.projects.filter((_, i) => i !== index);
    setResume({ ...resume, data: { ...resume.data, projects } });
  };

  const generateSummary = async () => {
    setAiLoading(true);
    try {
      const response = await axios.post(`${API}/ai/generate-summary`, {
        prompt: 'Generate summary',
        context: {
          experiences: resume.data.experiences,
          internships: resume.data.internships,
          hackathons: resume.data.hackathons,
          skills: resume.data.skills
        }
      });
      updateSummary(response.data.summary);
      if (response.data.note) {
        toast.info(response.data.note);
      } else {
        toast.success('Summary generated!');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate summary');
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
                  <TabsList className="grid grid-cols-4 w-full mb-4" data-testid="builder-tabs">
                    <TabsTrigger value="personal" data-testid="personal-tab">Personal</TabsTrigger>
                    <TabsTrigger value="summary" data-testid="summary-tab">Summary</TabsTrigger>
                    <TabsTrigger value="work" data-testid="work-tab">Work</TabsTrigger>
                    <TabsTrigger value="achievements" data-testid="achievements-tab">Achievements</TabsTrigger>
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
                    <div className="grid grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={resume.data.personal_info.linkedin}
                          onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                          placeholder="linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div>
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          value={resume.data.personal_info.github}
                          onChange={(e) => updatePersonalInfo('github', e.target.value)}
                          placeholder="github.com/yourusername"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <Label>Professional Summary</Label>
                      <Button size="sm" onClick={generateSummary} disabled={aiLoading} data-testid="generate-summary-btn">
                        <Sparkles className="w-4 h-4 mr-2" />
                        {aiLoading ? 'Generating...' : 'AI Generate'}
                      </Button>
                    </div>
                    <Textarea
                      rows={6}
                      value={resume.data.summary}
                      onChange={(e) => updateSummary(e.target.value)}
                      placeholder="Write a compelling 2-3 sentence summary highlighting your strengths..."
                      data-testid="summary-textarea"
                    />
                  </TabsContent>

                  <TabsContent value="work" className="space-y-6 mt-4">
                    {/* Work Experience */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                          <Label className="text-base font-semibold">Work Experience</Label>
                        </div>
                        <Button size="sm" onClick={addExperience} data-testid="add-experience-btn">
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      {resume.data.experiences.map((exp, index) => (
                        <Card key={exp.id} className="mb-3" data-testid={`experience-item-${index}`}>
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-end">
                              <Button size="sm" variant="ghost" onClick={() => deleteExperience(index)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Job Title"
                              value={exp.title}
                              onChange={(e) => updateExperience(index, 'title', e.target.value)}
                            />
                            <Input
                              placeholder="Company"
                              value={exp.organization}
                              onChange={(e) => updateExperience(index, 'organization', e.target.value)}
                            />
                            <Input
                              placeholder="Location"
                              value={exp.location}
                              onChange={(e) => updateExperience(index, 'location', e.target.value)}
                            />
                            <Textarea
                              placeholder="Description & key achievements"
                              value={exp.description}
                              onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              rows={3}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Start Date"
                                value={exp.start_date}
                                onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                              />
                              <Input
                                placeholder="End Date"
                                value={exp.end_date}
                                onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Internships */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-green-600" />
                          <Label className="text-base font-semibold">Internships</Label>
                        </div>
                        <Button size="sm" onClick={addInternship} data-testid="add-internship-btn">
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      {resume.data.internships.map((intern, index) => (
                        <Card key={intern.id} className="mb-3" data-testid={`internship-item-${index}`}>
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-end">
                              <Button size="sm" variant="ghost" onClick={() => deleteInternship(index)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Internship Title"
                              value={intern.title}
                              onChange={(e) => updateInternship(index, 'title', e.target.value)}
                            />
                            <Input
                              placeholder="Company"
                              value={intern.company}
                              onChange={(e) => updateInternship(index, 'company', e.target.value)}
                            />
                            <Input
                              placeholder="Location"
                              value={intern.location}
                              onChange={(e) => updateInternship(index, 'location', e.target.value)}
                            />
                            <Textarea
                              placeholder="Description & responsibilities"
                              value={intern.description}
                              onChange={(e) => updateInternship(index, 'description', e.target.value)}
                              rows={3}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Start Date"
                                value={intern.start_date}
                                onChange={(e) => updateInternship(index, 'start_date', e.target.value)}
                              />
                              <Input
                                placeholder="End Date"
                                value={intern.end_date}
                                onChange={(e) => updateInternship(index, 'end_date', e.target.value)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Education */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <Label className="text-base font-semibold">Education</Label>
                        <Button size="sm" onClick={addEducation} data-testid="add-education-btn">
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      {resume.data.education.map((edu, index) => (
                        <Card key={edu.id} className="mb-3" data-testid={`education-item-${index}`}>
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-end">
                              <Button size="sm" variant="ghost" onClick={() => deleteEducation(index)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            />
                            <Input
                              placeholder="Institution"
                              value={edu.institution}
                              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            />
                            <Input
                              placeholder="Field of Study"
                              value={edu.field}
                              onChange={(e) => updateEducation(index, 'field', e.target.value)}
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <Input
                                placeholder="Start"
                                value={edu.start_date}
                                onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                              />
                              <Input
                                placeholder="End"
                                value={edu.end_date}
                                onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                              />
                              <Input
                                placeholder="GPA"
                                value={edu.gpa}
                                onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Skills */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <Label className="text-base font-semibold">Skills</Label>
                        <Button size="sm" onClick={addSkill} data-testid="add-skill-btn">
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {resume.data.skills.map((skill, index) => (
                          <div key={skill.id} className="flex gap-2 items-center" data-testid={`skill-item-${index}`}>
                            <Input
                              placeholder="Skill"
                              value={skill.name}
                              onChange={(e) => updateSkill(index, 'name', e.target.value)}
                              className="flex-1"
                            />
                            <Button size="sm" variant="ghost" onClick={() => deleteSkill(index)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="achievements" className="space-y-6 mt-4">
                    {/* Hackathons */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-amber-600" />
                          <Label className="text-base font-semibold">Hackathons</Label>
                        </div>
                        <Button size="sm" onClick={addHackathon} data-testid="add-hackathon-btn">
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      {resume.data.hackathons.map((hack, index) => (
                        <Card key={hack.id} className="mb-3" data-testid={`hackathon-item-${index}`}>
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-end">
                              <Button size="sm" variant="ghost" onClick={() => deleteHackathon(index)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Hackathon Name"
                              value={hack.name}
                              onChange={(e) => updateHackathon(index, 'name', e.target.value)}
                            />
                            <Input
                              placeholder="Organizer"
                              value={hack.organizer}
                              onChange={(e) => updateHackathon(index, 'organizer', e.target.value)}
                            />
                            <Input
                              placeholder="Project Title"
                              value={hack.project_title}
                              onChange={(e) => updateHackathon(index, 'project_title', e.target.value)}
                            />
                            <Input
                              placeholder="Achievement (Winner, Runner-up, etc.)"
                              value={hack.achievement}
                              onChange={(e) => updateHackathon(index, 'achievement', e.target.value)}
                            />
                            <Textarea
                              placeholder="Project description"
                              value={hack.description}
                              onChange={(e) => updateHackathon(index, 'description', e.target.value)}
                              rows={3}
                            />
                            <Input
                              placeholder="Date"
                              value={hack.date}
                              onChange={(e) => updateHackathon(index, 'date', e.target.value)}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Projects */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Code className="w-5 h-5 text-purple-600" />
                          <Label className="text-base font-semibold">Projects</Label>
                        </div>
                        <Button size="sm" onClick={addProject} data-testid="add-project-btn">
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      {resume.data.projects.map((proj, index) => (
                        <Card key={proj.id} className="mb-3" data-testid={`project-item-${index}`}>
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-end">
                              <Button size="sm" variant="ghost" onClick={() => deleteProject(index)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Project Title"
                              value={proj.title}
                              onChange={(e) => updateProject(index, 'title', e.target.value)}
                            />
                            <Textarea
                              placeholder="Description"
                              value={proj.description}
                              onChange={(e) => updateProject(index, 'description', e.target.value)}
                              rows={3}
                            />
                            <Input
                              placeholder="Project Link (optional)"
                              value={proj.link}
                              onChange={(e) => updateProject(index, 'link', e.target.value)}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Events */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-rose-600" />
                          <Label className="text-base font-semibold">Events & Activities</Label>
                        </div>
                        <Button size="sm" onClick={addEvent} data-testid="add-event-btn">
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      {resume.data.events.map((event, index) => (
                        <Card key={event.id} className="mb-3" data-testid={`event-item-${index}`}>
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-end">
                              <Button size="sm" variant="ghost" onClick={() => deleteEvent(index)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Event Title"
                              value={event.title}
                              onChange={(e) => updateEvent(index, 'title', e.target.value)}
                            />
                            <Input
                              placeholder="Organization"
                              value={event.organization}
                              onChange={(e) => updateEvent(index, 'organization', e.target.value)}
                            />
                            <Input
                              placeholder="Your Role (Organizer, Speaker, Participant, etc.)"
                              value={event.role}
                              onChange={(e) => updateEvent(index, 'role', e.target.value)}
                            />
                            <Textarea
                              placeholder="Description"
                              value={event.description}
                              onChange={(e) => updateEvent(index, 'description', e.target.value)}
                              rows={2}
                            />
                            <Input
                              placeholder="Date"
                              value={event.date}
                              onChange={(e) => updateEvent(index, 'date', e.target.value)}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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

          {/* Preview Panel - rendering omitted for brevity, similar to original but includes all new sections */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border-2 border-slate-200 p-8 rounded-lg overflow-y-auto max-h-[calc(100vh-16rem)] resume-preview" data-testid="resume-preview">
                  {resume.data.personal_info.full_name && (
                    <div className="text-center mb-6">
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">{resume.data.personal_info.full_name}</h1>
                      <div className="text-slate-600 text-sm space-x-2">
                        {resume.data.personal_info.email && <span>{resume.data.personal_info.email}</span>}
                        {resume.data.personal_info.phone && <span>| {resume.data.personal_info.phone}</span>}
                        {resume.data.personal_info.location && <span>| {resume.data.personal_info.location}</span>}
                      </div>
                    </div>
                  )}

                  {resume.data.summary && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-2 pb-1 border-b-2 border-blue-600">PROFESSIONAL SUMMARY</h2>
                      <p className="text-slate-700 text-sm">{resume.data.summary}</p>
                    </div>
                  )}

                  {resume.data.experiences.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b-2 border-blue-600">EXPERIENCE</h2>
                      {resume.data.experiences.map((exp) => (
                        <div key={exp.id} className="mb-4">
                          <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                          <p className="text-slate-700 text-sm">{exp.organization}</p>
                          <p className="text-xs text-slate-500 mb-1">{exp.start_date} - {exp.end_date}</p>
                          <p className="text-slate-700 text-sm">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.data.internships.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b-2 border-green-600">INTERNSHIPS</h2>
                      {resume.data.internships.map((intern) => (
                        <div key={intern.id} className="mb-4">
                          <h3 className="font-semibold text-slate-900">{intern.title}</h3>
                          <p className="text-slate-700 text-sm">{intern.company}</p>
                          <p className="text-xs text-slate-500 mb-1">{intern.start_date} - {intern.end_date}</p>
                          <p className="text-slate-700 text-sm">{intern.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.data.hackathons.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b-2 border-amber-600">HACKATHONS</h2>
                      {resume.data.hackathons.map((hack) => (
                        <div key={hack.id} className="mb-4">
                          <h3 className="font-semibold text-slate-900">{hack.name} - {hack.organizer}</h3>
                          <p className="text-slate-700 text-sm font-medium">{hack.project_title}</p>
                          {hack.achievement && <p className="text-amber-600 text-sm font-semibold">{hack.achievement}</p>}
                          <p className="text-xs text-slate-500 mb-1">{hack.date}</p>
                          <p className="text-slate-700 text-sm">{hack.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.data.education.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b-2 border-blue-600">EDUCATION</h2>
                      {resume.data.education.map((edu) => (
                        <div key={edu.id} className="mb-3">
                          <h3 className="font-semibold text-slate-900">{edu.degree} - {edu.field}</h3>
                          <p className="text-slate-700 text-sm">{edu.institution}</p>
                          <p className="text-xs text-slate-500">{edu.start_date} - {edu.end_date}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.data.projects.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b-2 border-purple-600">PROJECTS</h2>
                      {resume.data.projects.map((proj) => (
                        <div key={proj.id} className="mb-3">
                          <h3 className="font-semibold text-slate-900">{proj.title}</h3>
                          <p className="text-slate-700 text-sm">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.data.events.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b-2 border-rose-600">EVENTS & ACTIVITIES</h2>
                      {resume.data.events.map((event) => (
                        <div key={event.id} className="mb-3">
                          <h3 className="font-semibold text-slate-900">{event.title} - {event.organization}</h3>
                          {event.role && <p className="text-slate-600 text-sm italic">{event.role}</p>}
                          <p className="text-xs text-slate-500 mb-1">{event.date}</p>
                          <p className="text-slate-700 text-sm">{event.description}</p>
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
