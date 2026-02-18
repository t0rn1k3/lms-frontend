# EduManage – Setup & Deployment Notes

## Package name change

The npm package name was updated from `lms-frontend` to `edumanage`.

### When to update the package name elsewhere

**Check and update the package name if you:**

1. **Set up CI/CD** (GitHub Actions, GitLab CI, Jenkins)
   - Update any job or script that references `lms-frontend`

2. **Configure deployment** (Vercel, Netlify, AWS, Docker)
   - Update project/app name if it uses the old package name

3. **Use a monorepo** (npm/yarn workspaces)
   - Update workspace references from `lms-frontend` to `edumanage`

4. **Add Docker**
   - Update image names or labels that use the old project name

5. **Configure Kubernetes / Cloud Run**
   - Update deployment or service names if they used `lms-frontend`

You can delete this file once deployment is set up.
