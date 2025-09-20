from pathlib import Path

path = Path('src/components/profile/ProfileForm.tsx')
lines = path.read_text().splitlines()

def replace_block(start, end, new_lines):
    return lines[:start] + new_lines + lines[end:]

try:
    submit_idx = lines.index("  const handleSubmit = async (e: React.FormEvent) => {")
except ValueError:
    raise SystemExit('handleSubmit line not found')
try:
    input_idx = lines.index("  const handleInputChange = (field: keyof UserProfile, value: any) => {")
except ValueError:
    raise SystemExit('handleInputChange line not found')
new_submit_lines = [
"  const handleSubmit = async (e: React.FormEvent) => {",
"    e.preventDefault()",
"    setLoading(true)",
"    setSuccess(false)",
"    try {",
"      const payload: Partial<UserProfile> = {",
"        ...formData,",
"        displayName: formData.displayName?.trim() ? formData.displayName.trim() : undefined,",
"        gender: formData.gender ?? undefined,",
"        age: typeof formData.age === 'number' && Number.isFinite(formData.age) ? formData.age : undefined,",
"        height: typeof formData.height === 'number' && Number.isFinite(formData.height) ? formData.height : undefined,",
"        weight: typeof formData.weight === 'number' && Number.isFinite(formData.weight) ? formData.weight : undefined,",
"        photoURL: formData.photoURL or None",
"      }",
"      await updateUserProfile(payload)",
"      setSuccess(true)",
"      toast({ variant: 'success', title: 'Profile updated' })",
"    } catch (error) {",
"      console.error('Failed to update profile:', error)",
"      toast({ variant: 'error', title: 'Failed to update profile' })",
"    } finally {",
"      setLoading(false)",
"    }",
"  }",
"",
]
# fix photoURL line to correct syntax
new_submit_lines[12] = "        photoURL: formData.photoURL || undefined,"

lines = lines[:submit_idx] + new_submit_lines + lines[input_idx:]
# After insertion we still have old handleSubmit lines duplicates because we appended new block but didn't remove old; need to remove old old block ??? This approach wrong. Need restructure.
