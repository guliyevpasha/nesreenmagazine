# GitHub və Vercel Setup Təlimatı

## 1. GitHub Repo Yaradın
- GitHub.com-da "New Repository" → "nesreenmagazine" → Public → Create

## 2. Local Git Remote Əlavə Edin
Aşağıdakı komandaları terminal-da işə salın (YOUR_USERNAME yerinə öz GitHub username-nizi yazın):

```bash
git remote add origin https://github.com/YOUR_USERNAME/nesreenmagazine.git
git branch -M main
git push -u origin main
```

## 3. Vercel-GitHub Əlaqəsi
1. https://vercel.com/dashboard-a gidin
2. "nesreenmagazine" proyektini tapın
3. Settings → Git Repository 
4. "Connect Git Repository" düyməsinə basın
5. GitHub hesabınıza icazə verin
6. "nesreenmagazine" repo-sunu seçin
7. "Connect" basın

## 4. Avtomatik Deploy Tənzimləməsi
Vercel avtomatik olaraq:
- `main` branch-ə hər push production deploy edəcək
- Digər branch-lər preview deploy edəcək
- Pull request-lər preview link yaradacaq

## 5. Test
Dəyişiklik edib push edin:
```bash
git add .
git commit -m "Test deploy from GitHub"
git push
```

Vercel avtomatik olaraq yeni versiyonu deploy edəcək!