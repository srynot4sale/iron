<table>
<tbody>
<?php

    foreach ($pages as $page)
    {
?>
    <tr>
        <td>
            <?= htmlentities($page['text']) ?>
        </td>
    </tr>

<?php
    }
?>
</tbody>
</table>
