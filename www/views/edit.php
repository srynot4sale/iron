<h2>Edit</h2>

<form method="POST">
<p>
<textarea name="text" cols="100" rows="10" style="padding: 0.5em;"><?= htmlentities($page['text']) ?></textarea>
</p>
<p>
    <input type="submit" value="Edit" />
    <a href="/">Cancel</a>
</p>
</form>
