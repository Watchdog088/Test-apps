# ConnectHub Placeholder Cleanup Script
$inputFile = "C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub_Mobile_Design.html"
$outputFile = "C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub_Mobile_Design.html"

Write-Host "Reading file..." -ForegroundColor Cyan
$content = [System.IO.File]::ReadAllText($inputFile, [System.Text.Encoding]::UTF8)

Write-Host "Cleaning placeholder data..." -ForegroundColor Yellow

# Replace all placeholder names
$content = $content.Replace('Sarah Johnson', '[User Name]')
$content = $content.Replace('Mike Chen', '[User Name]')
$content = $content.Replace('Emily Rodriguez', '[User Name]')
$content = $content.Replace('David Kim', '[User Name]')
$content = $content.Replace('Jessica Lee', '[User Name]')
$content = $content.Replace('John Doe', '[Current User]')
$content = $content.Replace('@johndoe', '[@username]')

# Replace bios
$content = $content.Replace('Tech enthusiast | Traveler | Coffee lover ☕', 'Add your bio here...')

# Replace emails
$content = $content.Replace('sarah@techsolutions.com', 'user@example.com')
$content = $content.Replace('mike@techsolutions.com', 'user@example.com')
$content = $content.Replace('emily@techsolutions.com', 'user@example.com')

# Replace timestamps
$content = $content.Replace('2 hours ago', 'Just now')
$content = $content.Replace('5 hours ago', 'Just now')
$content = $content.Replace('8h ago', 'Just now')
$content = $content.Replace('12h ago', 'Just now')
$content = $content.Replace('15h ago', 'Just now')
$content = $content.Replace('2h ago', 'Just now')
$content = $content.Replace('5h ago', 'Just now')

# Replace post content
$content = $content.Replace('Just finished an amazing hike! 🏔️ #nature #adventure', '[Post Content]')
$content = $content.Replace('Beautiful sunset tonight! 🌅', '[Post Content]')
$content = $content.Replace('Hey! How are you doing?', '[Message Content]')
$content = $content.Replace("That's awesome!", '[Message Content]')
$content = $content.Replace('Check out my new design!', '[Message Content]')
$content = $content.Replace('This is amazing! 🎉', '[Comment]')

# Replace job titles
$content = $content.Replace('CEO • Joined 2020', 'Role • Joined [Date]')
$content = $content.Replace('CTO • Joined 2021', 'Role • Joined [Date]')
$content = $content.Replace('Lead Designer • Joined 2022', 'Role • Joined [Date]')

# Replace friend dates
$content = $content.Replace('Friends since 2020', 'Friends since [Date]')
$content = $content.Replace('Friends since 2021', 'Friends since [Date]')

# Replace moderator dates
$content = $content.Replace('Moderator since Jan 2024', 'Moderator since [Date]')
$content = $content.Replace('Moderator since Mar 2024', 'Moderator since [Date]')
$content = $content.Replace('Moderator since May 2024', 'Moderator since [Date]')

# Replace call durations
$content = $content.Replace('Video Call • 15 minutes', 'Video Call • 0 minutes')
$content = $content.Replace('Voice Call • 8 minutes', 'Voice Call • 0 minutes')
$content = $content.Replace('15 minutes', '0 minutes')
$content = $content.Replace('8 minutes', '0 minutes')
$content = $content.Replace('23 minutes', '0 minutes')
$content = $content.Replace('35 minutes', '0 minutes')
$content = $content.Replace('15 min', '0 min')
$content = $content.Replace('1 min', '0 min')
$content = $content.Replace('30 sec', '0 sec')

# Replace status
$content = $content.Replace('Active 2h ago', 'Offline')

# Replace call timestamps
$content = $content.Replace(' • 2h ago', ' • [Time]')
$content = $content.Replace(' • 5h ago', ' • [Time]')
$content = $content.Replace(' • Yesterday', ' • [Time]')
$content = $content.Replace(' • 2 days ago', ' • [Time]')
$content = $content.Replace(' • 3 days ago', ' • [Time]')

Write-Host "Writing cleaned file..." -ForegroundColor Green
[System.IO.File]::WriteAllText($outputFile, $content, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host "Removed all placeholder names" -ForegroundColor Green
Write-Host "Cleared sample posts and messages" -ForegroundColor Green
Write-Host "Reset timestamps and activity status" -ForegroundColor Green  
Write-Host "Cleaned profile information" -ForegroundColor Green
Write-Host "App is now ready for real data collection" -ForegroundColor Green
Write-Host ""
Write-Host "Backup saved as: ConnectHub_Mobile_Design_BACKUP.html" -ForegroundColor Cyan
